var pad = '                                        ';

var reportList = function (collection, field, criteria, message) {
  message = message || collection + ' with invalid ' + field;

  var count = db[collection].count(criteria);
  if (count) {
    print('\n' + message + ':');
    db[collection].find(criteria).forEach(function (obj) {
      if (field.indexOf('.') === -1) {
        print(obj._id + ': ' + obj[field]);
      }
      else {
        print(obj._id);
      }
    });
  }
};

var reportTotal = function (collection, criteria, message) {
  var count = db[collection].count(criteria);
  if (count) {
    print('\n' + count + ' ' + collection + ' ' + message);
  }
};

// Do all documents belong to valid jurisdictions?
var jurisdictions = db.metadata.distinct('_id');
['bills', 'committees', 'events', 'legislators', 'votes'].forEach(function (collection) {
  reportList(collection, 'state', {
    state: {
      '$nin': jurisdictions,
    },
  });
});
['districts', 'subjects'].forEach(function (collection) {
  reportList(collection, 'abbr', {
    abbr: {
      '$nin': jurisdictions,
    },
  });
});
reportList('legislators', 'roles.state', {
  roles: {
    '$ne': [],
  },
  'roles.state': {
    '$nin': jurisdictions,
  },
});

// Do all documents belong to valid chambers and districts?
db.metadata.find().forEach(function (obj) {
  var chambers = [], chamber;
  for (chamber in obj.chambers) {
    chambers.push(chamber);
  }
  var districts = db.districts.distinct('name', {abbr: obj._id});

  ['bills', 'districts', 'legislators', 'votes'].forEach(function (collection) {
    reportList(collection, 'chamber', {
      state: obj._id,
      chamber: {
        '$exists': true,
        '$nin': chambers,
      },
    }, obj._id.toUpperCase() + ' ' + collection + ' with invalid chamber');
  });

  var chambers_plus_other = chambers.concat(['joint', 'other']);

  reportList('events', 'participants.chamber', {
    state: obj._id,
    'participants.chamber': {
      '$exists': true,
      '$nin': chambers_plus_other,
    },
  }, obj._id.toUpperCase() + ' events with invalid participants.chamber (e.g. "Senate")');

  var chambers_plus_joint = chambers.concat(['joint']);

  reportList('committees', 'chamber', {
    state: obj._id,
    'chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint,
    },
  }, obj._id.toUpperCase() + ' committees with invalid chamber');

  reportList('legislators', 'roles.chamber', {
    state: obj._id,
    'roles.chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint,
    },
  }, obj._id.toUpperCase() + ' legislators with invalid roles.chamber');

  ['district', 'roles.district'].forEach(function (field) {
    var criteria = {state: obj._id}
    criteria[field] = {
      '$exists': true,
      '$nin': districts,
    }
    reportList('legislators', field, criteria, obj._id.toUpperCase() + ' legislators with invalid ' + field);
  });
});

// Do any inactive legislators have roles?
reportList('legislators', 'roles.state', {
  active: false,
  roles: {
    '$ne': [],
  },
}, 'Inactive legislators with roles');

// Do any legislators belong to unknown parties?
reportList('legislators', 'party', {
  party: {
    '$in': ['Unknown', 'unknown'],
  }
});

// Are any addresses nearly blank?
reportList('legislators', 'offices.address', {
  'offices.address': ',',
}, 'Legislators with invalid offices.address (",")');

// Are genders taken from a code list?
reportList('legislators', '+gender', {
  '+gender': {
    '$exists': true,
    '$nin': ['Female', 'Male'],
  },
});

// Are office types taken from a code list?
reportList('legislators', 'offices.type', {
  'offices': {
    '$ne': [],
  },
  'offices.type': {
    '$nin': ['capitol', 'district'],
  },
});

// Are any photo URLs relative paths?
reportList('legislators', 'photo_url', {
  photo_url: {
    '$exists': true,
    '$nin': ['', null, /^http/],
  },
});

// Any spaces in IDs?
['transparencydata_id', 'nimsp_id', 'nimsp_candidate_id', 'votesmart_id'].forEach(function (field) {
  var criteria1 = {};
  criteria1[field] = {
    '$exists': true,
    '$in': [/ /],
  };
  reportList('legislators', field, criteria1);

  var criteria2 = {};
  criteria2[field] = {
    '$exists': true,
    '$in': ['', null],
  };
  reportTotal('legislators', criteria2, 'have a blank ' + field + ' ("" or null)');
});

// Are any photo URLs blank?
reportTotal('legislators', {
  photo_url: {
    '$exists': true,
    '$in': ['', null],
  },
}, 'have a blank photo_url');

// Manually review the list of party names.
print('\nDistinct parties for manual review:');
db.legislators.mapReduce(function () {
  emit(this.party || 'sanity', 1);
}, function (key, values) {
  return Array.sum(values);
}, {out: {inline: 1}}).results.forEach(function (result) {
  if (result._id != 'sanity') {
    print(result._id + pad.substring(0, 40 - result._id.length) + result.value);
  }
});

print('\nDone!');
