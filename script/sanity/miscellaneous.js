// abbreviation should be equal to _id.
reportList('metadata', 'abbreviation', {
  '$where': function () {
    return this._id != this.abbreviation;
  }
}, 'metadata whose abbreviation is not equal to _id');

// _id should be predictable.
reportList('districts', '_id', {
  '$where': function () {
    return this._id != this.abbr + '-' + this.chamber + '-' + this.name;
  }
}, 'districts whose _id is not in the format "abbr-chamber-name"');

// leg_id should be equal to _id.
reportList('legislators', 'leg_id', {
  '$where': function () {
    return this._id != this.leg_id;
  }
}, 'legislators whose leg_id is not equal to _id');

// Legislators with unnecessary prefixes.
reportList('legislators', 'full_name', {
  full_name: /(Representative|Senator)/
}, 'legislators with unnecessary prefixes');

// Legislators with unnecessary suffixes.
reportList('legislators', 'full_name', {
  full_name: /\)$/
}, 'legislators with unnecessary suffixes');

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

// Are any photo URLs blank?
reportTotal('legislators', {
  photo_url: {
    '$exists': true,
    '$in': ['', null]
  }
}, 'have a blank photo_url ("" or null)');

// Are any addresses nearly blank?
// @note Can add `minLength` property to person.json schema.
reportList('legislators', 'offices.address', {
  'offices.address': ','
}, 'legislators with invalid offices.address (",")');

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

// Any null voters?
reportList('votes', '.', {
  '_voters': null
}, 'votes with null in _voters');

// Are any URLs relative paths?
// @note Can add `pattern` property schemas.
var fields = {
  bills: [
    'documents.url',
    'sources.url',
    'sponsors.+leg_url',
    'sponsors.+main_sponsor_url',
    'versions.url',
    'versions.+pdf_url',
    '+bill_url'
  ],
  committees: [
    'sources.url'
  ],
  events: [
    'documents.url',
    'sources.url',
    '+location_url'
  ],
  legislators: [
    'offices.+url',
    'photo_url',
    'sources.url',
    'url',
    '+additional_info_url',
    '+facebook_url',
    '+image_url',
    '+img_url',
    '+leg_url',
    '+url'
  ],
  votes: [
    'sources.url'
  ]
};
for (var collection in fields) {
  fields[collection].forEach(function (field) {
    var criteria = {}
    criteria[field] = {
      '$exists': true,
      '$nin': ['', null, /^(?:http|ftp)/]
    };
    reportList(collection, field, criteria);
  });
}
