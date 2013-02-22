var reportInvalidForeignKeys = function (collection, field, relation, callback) {
  var ids = db[collection].distinct(field);
  ids.splice(ids.indexOf(null), 1);
  if (callback) {
    ids = ids.filter(callback);
  }

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

// actions.related_entities.id can either point to a committee or a legislator.
reportInvalidForeignKeys('bills', 'actions.related_entities.id', 'committees', function (id) {
  return /C[0-9]{6}$/.test(id);
});
reportInvalidForeignKeys('bills', 'actions.related_entities.id', 'legislators', function (id) {
  return /L[0-9]{6}$/.test(id);
});

var reportAsymmetricForeignKeys = function (parent, child, parent_field, child_field) {
  print('\nLooking for asymmetries from ' + parent + ' to ' + child + '...');
  var count = 0;
  var criteria = {};
  var fields = parent_field.split('.');
  criteria[parent_field] = {
    '$exists': true,
    '$ne': null,
  };
  db[parent].find(criteria).forEach(function (document) {
    document[fields[0]].forEach(function (subdocument) {
      var id = subdocument[fields[1]];
      if (id) {
        var criteria = {_all_ids: id};
        criteria[child_field] = document._id;
        if (!db[child].count(criteria)) {
          count += 1;
          print(document._id + '-' + id);
        }
      }
    })
  });
  if (count) {
    print(count + ' ' + parent + '-' + child + ' asymmetries found.');
  }
}

reportAsymmetricForeignKeys('committees', 'legislators', 'members.leg_id', 'roles.committee_id');
reportAsymmetricForeignKeys('legislators', 'committees', 'roles.committee_id', 'members.leg_id');
