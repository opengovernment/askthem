// Top-level committees should not have parent IDs.
reportList('committees', 'parent_id', {
  subcommittee: null,
  parent_id: {
    '$ne': null
  }
}, 'committees with parent IDs');

// Subcommittees should have parent IDs.
reportList('committees', 'parent_id', {
  parent_id: null,
  subcommittee: {
    '$ne': null
  }
}, 'subcommittees without parent IDs');

// A committee should not be its own parent.
reportList('committees', 'parent_id', {
  parent_id: {
    '$ne': null
  },
  '$where': function () {
    return this.parent_id == this._id;
  }
}, 'committees whose parent is themselves');

// Do all documents belong to valid jurisdictions?
print('\nThe next steps can take several seconds...');
var jurisdictions = db.metadata.distinct('_id');
['bills', 'committees', 'events', 'legislators', 'votes'].forEach(function (collection) {
  reportList(collection, 'state', {
    state: {
      '$nin': jurisdictions
    }
  });
});
['districts', 'subjects'].forEach(function (collection) {
  reportList(collection, 'abbr', {
    abbr: {
      '$nin': jurisdictions
    }
  });
});
reportList('legislators', 'roles.state', {
  roles: {
    '$ne': []
  },
  'roles.state': {
    '$nin': jurisdictions
  }
});

// Do all documents belong to valid chambers and districts?
db.metadata.find().forEach(function (obj) {
  var chambers = [], chamber;
  for (chamber in obj.chambers) {
    chambers.push(chamber);
  }

  // @note Can add `enum` to districts.json and person.json schemas.
  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L112
  ['bills', 'districts', 'legislators'].forEach(function (collection) {
    reportList(collection, 'chamber', {
      state: obj._id,
      chamber: {
        '$exists': true,
        '$nin': chambers
      }
    }, obj._id.toUpperCase() + ' ' + collection + ' with invalid chamber');
  });

  reportList('events', '+chamber', {
    state: obj._id,
    '+chamber': {
      '$exists': true,
      '$nin': chambers
    }
  }, obj._id.toUpperCase() + ' events with invalid +chamber');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/vote.json#L6
  reportList('votes', 'bill_chamber', {
    state: obj._id,
    bill_chamber: {
      '$exists': true,
      '$nin': chambers
    }
  }, obj._id.toUpperCase() + ' votes with invalid bill_chamber');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L152
  reportList('bills', 'sponsors.chamber', {
    state: obj._id,
    'sponsors.chamber': {
      '$exists': true,
      '$nin': chambers
    }
  }, obj._id.toUpperCase() + ' bills with invalid sponsors.chamber');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L103
  var chambers_plus_null = chambers.concat([null]);
  reportList('bills', 'companions.chamber', {
    state: obj._id,
    'companions.chamber': {
      '$exists': true,
      '$nin': chambers_plus_null
    }
  }, obj._id.toUpperCase() + ' bills with invalid companions.chamber');

  // @note Can add `enum` property to events.json schema.
  var chambers_plus_other = chambers.concat(['joint', 'other']);
  reportList('events', 'participants.chamber', {
    state: obj._id,
    'participants.chamber': {
      '$exists': true,
      '$nin': chambers_plus_other
    }
  }, obj._id.toUpperCase() + ' events with invalid participants.chamber (e.g. "Senate")');

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/committee.json#L6
  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/vote.json#L5
  var chambers_plus_joint = chambers.concat(['joint']);
  ['committees', 'votes'].forEach(function (collection) {
    reportList(collection, 'chamber', {
      state: obj._id,
      'chamber': {
        '$exists': true,
        '$nin': chambers_plus_joint
      }
    }, obj._id.toUpperCase() + ' ' + collection + ' with invalid chamber');
  });

  // @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/person.json#L11
  reportList('legislators', 'roles.chamber', {
    state: obj._id,
    'roles.chamber': {
      '$exists': true,
      '$nin': chambers_plus_joint
    }
  }, obj._id.toUpperCase() + ' legislators with invalid roles.chamber');

  var districts = db.districts.distinct('name', {abbr: obj._id});
  ['district', 'roles.district'].forEach(function (field) {
    var criteria = {state: obj._id};
    criteria[field] = {
      '$exists': true,
      '$nin': districts
    };
    reportList('legislators', field, criteria, obj._id.toUpperCase() + ' legislators with invalid ' + field);
  });
});
