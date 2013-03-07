// abbreviation should be equal to _id.
reportList('metadata', 'abbreviation', {
  '$where': function () {
    return this._id != this.abbreviation;
  }
}, 'metadata whose abbreviation is not equal to _id');

// leg_id should be equal to _id.
reportList('legislators', 'leg_id', {
  '$where': function () {
    return this._id != this.leg_id;
  }
}, 'legislators whose leg_id is not equal to _id');

// Do any inactive legislators have roles?
reportList('legislators', 'roles.state', {
  active: false,
  roles: {
    '$ne': []
  }
}, 'inactive legislators with roles');

// Do any legislators belong to unknown parties?
reportList('legislators', 'party', {
  party: {
    '$in': ['Unknown', 'unknown']
  }
});

// Are any addresses nearly blank?
// @note Can add `minLength` property to person.json schema.
reportList('legislators', 'offices.address', {
  'offices.address': ','
}, 'legislators with invalid offices.address (",")');

// Are any photo URLs relative paths?
// @note Can add `pattern` property to person.json schema.
reportList('legislators', 'photo_url', {
  photo_url: {
    '$exists': true,
    '$nin': ['', null, /^http/]
  }
});

// Any spaces in IDs?
['transparencydata_id', 'nimsp_id', 'nimsp_candidate_id', 'votesmart_id'].forEach(function (field) {
  var criteria1 = {};
  criteria1[field] = {
    '$exists': true,
    '$in': [/ /]
  };
  reportList('legislators', field, criteria1);

  var criteria2 = {};
  criteria2[field] = {
    '$exists': true,
    '$in': ['', null]
  };
  reportTotal('legislators', criteria2, 'have a blank ' + field + ' ("" or null)');
});

// Are any photo URLs blank?
reportTotal('legislators', {
  photo_url: {
    '$exists': true,
    '$in': ['', null]
  }
}, 'have a blank photo_url ("" or null)');
