// Finds documents in the given collection matching the given criteria. If any
// documents are found, prints the given message and, for each document, prints
// its ID and the value of the given field.
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

// Finds documents in the given collection matching the given criteria. If any
// documents are found, prints the number of documents found e.g. "100 bills"
// followed by the given message.
var reportTotal = function (collection, criteria, message) {
  var count = db[collection].count(criteria);
  if (count) {
    print('\n' + count + ' ' + collection + ' ' + message);
  }
};

// Foreign keys ////////////////////////////////////////////////////////////////

var reportInvalidForeignKeys = function (collection, field, relation) {
  var ids = db[collection].distinct(field);
  ids.splice(ids.indexOf(null), 1);
  var result = db[relation].find({
    _all_ids: {
      '$in': ids,
    },
  });

  if (result.size() < ids.length) {
    print('\ninvalid foreign keys in ' + collection + '.' + field + ':');
    var all_ids = [];
    result.forEach(function (obj) {
      all_ids = all_ids.concat(obj._all_ids);
    });
    ids.forEach(function (id) {
      if (all_ids.indexOf(id) === -1) {
        print(id);
      }
    });
  };
};

reportInvalidForeignKeys('committees', 'parent_id', 'committees');
reportInvalidForeignKeys('committees', 'members.leg_id', 'legislators');
reportInvalidForeignKeys('legislators', 'roles.committee_id', 'committees');
reportInvalidForeignKeys('bills', 'sponsors.leg_id', 'legislators');
reportInvalidForeignKeys('bills', 'actions.committee', 'committees');
reportInvalidForeignKeys('bills', 'companions.internal_id', 'bills');
// @todo actions.related_entities.id according to actions.related_entities.type

// Valid jurisdictions, chambers and districts /////////////////////////////////

// Do all documents belong to valid jurisdictions? (always passes, thus far)
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

  // @note Can add `enum` to districts.json and person.json schemas.
  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L112
  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/vote.json#L5
  ['bills', 'districts', 'legislators', 'votes'].forEach(function (collection) {
    reportList(collection, 'chamber', {
      state: obj._id,
      chamber: {
        '$exists': true,
        '$nin': chambers,
      },
    }, obj._id.toUpperCase() + ' ' + collection + ' with invalid chamber');
  });

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/vote.json#L6
  reportList('votes', 'bill_chamber', {
    state: obj._id,
    bill_chamber: {
      '$exists': true,
      '$nin': chambers,
    },
  }, obj._id.toUpperCase() + ' votes with invalid bill_chamber');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L152
  reportList('bills', 'sponsors.chamber', {
    state: obj._id,
    'sponsors.chamber': {
      '$exists': true,
      '$nin': chambers,
    },
  }, obj._id.toUpperCase() + ' bills with invalid sponsors.chamber');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L103
  var chambers_plus_null = chambers.concat([null]);
  reportList('bills', 'companions.chamber', {
    state: obj._id,
    'companions.chamber': {
      '$exists': true,
      '$nin': chambers_plus_null,
    },
  }, obj._id.toUpperCase() + ' bills with invalid companions.chamber');

  // @note Can add `enum` property to events.json schema.
  var chambers_plus_other = chambers.concat(['joint', 'other']);
  reportList('events', 'participants.chamber', {
    state: obj._id,
    'participants.chamber': {
      '$exists': true,
      '$nin': chambers_plus_other,
    },
  }, obj._id.toUpperCase() + ' events with invalid participants.chamber (e.g. "Senate")');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/committee.json#L6
  var chambers_plus_joint = chambers.concat(['joint']);
  reportList('committees', 'chamber', {
    state: obj._id,
    'chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint,
    },
  }, obj._id.toUpperCase() + ' committees with invalid chamber');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/person.json#L11
  reportList('legislators', 'roles.chamber', {
    state: obj._id,
    'roles.chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint,
    },
  }, obj._id.toUpperCase() + ' legislators with invalid roles.chamber');

  var districts = db.districts.distinct('name', {abbr: obj._id});
  ['district', 'roles.district'].forEach(function (field) {
    var criteria = {state: obj._id};
    criteria[field] = {
      '$exists': true,
      '$nin': districts,
    };
    reportList('legislators', field, criteria, obj._id.toUpperCase() + ' legislators with invalid ' + field);
  });
});

// Code lists //////////////////////////////////////////////////////////////////

// Genders
// @note Can add `enum` property if `gender` is added to the schema.
reportList('legislators', '+gender', {
  '+gender': {
    '$exists': true,
    '$nin': ['Female', 'Male'],
  },
});

// Office types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/person.json#L27
reportList('legislators', 'offices.type', {
  'offices': {
    '$ne': [],
  },
  'offices.type': {
    '$nin': ['capitol', 'district'],
  },
});

// Bill action types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L45
reportList('bills', 'actions.type', {
  'actions.type': {
    '$exists': true,
    '$nin': [
      'bill:introduced',
      'bill:passed',
      'bill:failed',
      'bill:withdrawn',
      'bill:substituted',
      'bill:filed',
      'bill:veto_override:passed',
      'bill:veto_override:failed',
      'governor:received',
      'governor:signed',
      'governor:vetoed',
      'governor:vetoed:line-item',
      'amendment:introduced',
      'amendment:passed',
      'amendment:failed',
      'amendment:tabled',
      'amendment:amended',
      'amendment:withdrawn',
      'committee:referred',
      'committee:failed',
      'committee:passed',
      'committee:passed:favorable',
      'committee:passed:unfavorable',
      'bill:reading:1',
      'bill:reading:2',
      'bill:reading:3',
      'other',
    ],
  },
});

// Bill action actors
reportList('bills', 'actions.actor', {
  'actions.actor': {
    '$exists': true,
    '$nin': [/^lower/, /^upper/, 'other', 'executive'],
  },
}, 'bills with invalid actions.actor (e.g. "Senate" or "House")');

// Bill action related entity type
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L22
reportList('bills', 'actions.related_entities.type', {
  'actions.related_entities.type': {
    '$exists': true,
    '$nin': ['committee', 'legislator'],
  },
});

// Bill sponsor types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L152
reportList('bills', 'sponsors.type', {
  'sponsors.type': {
    '$exists': true,
    '$nin': ['primary', 'cosponsor'],
  },
});

// Bill MIME types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L190
['documents.mimetype', 'versions.mimetype'].forEach(function (field) {
  var criteria = {}
  criteria[field] = {
    '$exists': true,
    '$nin': [
      'text/html',
      'application/pdf',
      'application/msword',
      'application/rtf',
      'application/octet-stream',
      'application/vnd.wordperfect',
    ],
  };
  reportList('bills', field, criteria);
});

// Invalid values //////////////////////////////////////////////////////////////

// Do any inactive legislators have roles?
reportList('legislators', 'roles.state', {
  active: false,
  roles: {
    '$ne': [],
  },
}, 'inactive legislators with roles');

// Do any legislators belong to unknown parties?
reportList('legislators', 'party', {
  party: {
    '$in': ['Unknown', 'unknown'],
  }
});

// Are any addresses nearly blank?
// @note Can add `minLength` property to person.json schema.
reportList('legislators', 'offices.address', {
  'offices.address': ',',
}, 'legislators with invalid offices.address (",")');

// Are any photo URLs relative paths?
// @note Can add `pattern` property to person.json schema.
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

// Manual //////////////////////////////////////////////////////////////////////

// Used as part of a poor man's sprintf to align party counts.
var pad = '                                        ';

// Manually review the list of party names.
print('\nDistinct parties for manual review:');
db.legislators.mapReduce(function () {
  if (this.party) {
    emit(this.party, 1);
  }
}, function (key, values) {
  return Array.sum(values);
}, {out: {inline: 1}}).results.forEach(function (result) {
  print(result._id + pad.substring(0, 40 - result._id.length) + result.value);
});

print('\nDone!');
