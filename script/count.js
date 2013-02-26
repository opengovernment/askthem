var count = function (collection, message, criteria, callback) {
  var total = 0;
  var maximum = 0;
  var maximum_id = null;
  var minimum = Infinity;
  var minimum_id = null;
  var counts = [];

  db[collection].find(criteria).forEach(function (obj) {
    var count = callback.call(obj);
    counts.push(count);
    total += count;
    if (count > maximum) {
      maximum = count;
      maximum_id = obj._id;
    }
    if (count < minimum) {
      minimum = count;
      minimum_id = obj._id;
    }
  });

  var median;
  var index = Math.floor(counts.length / 2);
  counts.sort();
  if (counts.length % 2 === 1) {
    median = counts[index];
  }
  else {
    median = (counts[index - 1] + counts[index]) / 2;
  }

  print(collection + ': ' + message);
  print('mean   ' + (Math.round(total / db[collection].count(criteria) * 10) / 10));
  print('median ' + median);
  print('max    (' + maximum_id + ') ' + maximum);
  print('min    (' + minimum_id + ') ' + minimum);
}

count('bills', 'actions', {
  actions: {
    '$ne': [],
  }
}, function () {
  return this.actions.length;
});

count('bills', 'documents', {
  documents: {
    '$ne': [],
  },
}, function () {
  return this.documents.length;
});

count('bills', 'actions.related_entities', {
  'actions.related_entities': {
    '$nin': [[], null],
  },
}, function () {
  var count = 0;
  this.actions.forEach(function (action) {
    if (action.related_entities) {
      count += action.related_entities.length;
    }
  });
  return count;
});

count('bills', 'sponsors', {
  sponsors: {
    '$ne': [],
  },
}, function () {
  return this.sponsors.length;
});

count('bills', 'primary sponsors', {
  sponsors: {
    '$ne': [],
  },
}, function () {
  var count = 0;
  this.sponsors.forEach(function (sponsor) {
    if (sponsor.type == 'primary') {
      count += 1;
    }
  });
  return count;
});

count('bills', 'versions', {
  versions: {
    '$ne': [],
  },
}, function () {
  return this.versions.length;
});

count('bills', 'title length', {
  title: {
    '$exists': true,
  },
}, function () {
  return this.title.length;
});

count('bills', 'summary length', {
  summary: {
    '$nin': ['', null],
  },
}, function () {
  return this.summary.length;
});

count('committees', 'committee length', {}, function () {
  return this.committee.length;
});

count('committees', 'members', {
  members: {
    '$ne': [],
  },
}, function () {
  return this.members.length;
});

count('committees', 'subcommittee length', {
  subcommittee: {
    '$ne': null,
  },
}, function () {
  return this.subcommittee.length;
});

count('legislators', 'full_name length', {}, function () {
  return this.full_name.length;
});

count('legislators', 'roles', {
  roles: {
    '$ne': [],
  },
}, function () {
  return this.roles.length;
});

count('legislators', 'committee roles', {
  'roles.committee': {
    '$exists': true,
  }
}, function () {
  var count = 0;
  this.roles.forEach(function (role) {
    if (role.committee) {
      count += 1;
    }
  });
  return count;
});
