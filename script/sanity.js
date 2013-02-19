/**
 * Future work
 *
 * We can validate Billy documents against their schemas.
 */

var pad = '                                        ';

var reportList = function (collection, field, criteria, message) {
  message = message && message + ' ' || '';

  var count = db[collection].count(criteria);
  if (count) {
    print('\n' + message + collection + ' with invalid ' + field + ':');
    db[collection].find(criteria).forEach(function (obj) {
      if (field.indexOf('.') === -1) {
        print(obj._id + ': ' + obj[field]);
      }
      else {
        print(obj._id);
      }
    });
  }
}

var reportTotal = function (collection, criteria, message) {
  var count = db[collection].count(criteria);
  if (count) {
    print('\n' + count + ' ' + collection + ' ' + message);
  }
}

var distinct = function (collection, field) {
  print('\nDistinct ' + collection + '.' + field + ':');
  db[collection].mapReduce(function () {
    emit(this[field] || 'sanity', 1);
  }, function (key, values) {
    return Array.sum(values);
  }, {out: {inline: 1}}).results.forEach(function (result) {
    if (result._id != 'sanity') {
      print(result._id + pad.substring(0, 40 - result._id.length) + result.value);
    }
  });
}

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
    }, obj._id.toUpperCase());
  });

  chambers_plus_other = chambers.concat(['joint', 'other']);

  reportList('events', 'participants.chamber', {
    state: obj._id,
    'participants.chamber': {
      '$exists': true,
      '$nin': chambers_plus_other,
    },
  }, obj._id.toUpperCase());

  chambers_plus_joint = chambers.concat(['joint']);

  reportList('committees', 'chamber', {
    state: obj._id,
    'chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint,
    },
  }, obj._id.toUpperCase());

  reportList('legislators', 'roles.chamber', {
    state: obj._id,
    'roles.chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint,
    },
  }, obj._id.toUpperCase());

  ['district', 'roles.district'].forEach(function (field) {
    criteria = {state: obj._id}
    criteria[field] = {
      '$exists': true,
      '$nin': districts,
    }
    reportList('legislators', field, criteria, obj._id.toUpperCase());
  });
});

// Do any legislators belong to unknown parties?
reportList('legislators', 'party', {
  party: {
    '$in': ['Unknown', 'unknown'],
  }
});

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

// Are any photo URLs blank?
reportTotal('legislators', {
  photo_url: {
    '$exists': true,
    '$in': ['', null],
  },
}, 'have a blank photo_url');

// Manually review the list of party names.
distinct('legislators', 'party');

print('Done!');
