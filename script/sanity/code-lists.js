var mimetypes = [
  'text/html',
  'application/pdf',
  'application/msword',
  'application/rtf',
  'application/octet-stream',
  'application/vnd.wordperfect'
]

// Genders
// @note Can add `enum` property if `gender` is added to the schema.
reportList('legislators', '+gender', {
  '+gender': {
    '$exists': true,
    '$nin': ['Female', 'Male']
  }
});

// Status
reportList('legislators', '+leg_status', {
  '+leg_status': {
    '$exists': true,
    '$nin': ['Active', 'Deceased', 'Resigned']
  }
});

// Office types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/person.json#L27
reportList('legislators', 'offices.type', {
  'offices': {
    '$ne': []
  },
  'offices.type': {
    '$nin': ['capitol', 'district']
  }
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
      'other'
    ]
  }
});

// Bill action actors
reportList('bills', 'actions.actor', {
  'actions.actor': {
    '$exists': true,
    '$nin': [/^lower/, /^upper/, 'other', 'executive']
  }
}, 'bills with invalid actions.actor (e.g. "Senate" or "House")');

// Bill action related entity type
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L22
reportList('bills', 'actions.related_entities.type', {
  'actions.related_entities.type': {
    '$exists': true,
    '$nin': ['committee', 'legislator']
  }
});

// Bill sponsor types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L152
reportList('bills', 'sponsors.type', {
  'sponsors.type': {
    '$exists': true,
    '$nin': ['primary', 'cosponsor']
  }
});

// Bill MIME types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/bill.json#L190
['documents.mimetype', 'versions.mimetype'].forEach(function (field) {
  var criteria = {};
  criteria[field] = {
    '$exists': true,
    '$nin': mimetypes
  };
  reportList('bills', field, criteria);
});

// Document MIME types
reportList('events', 'documents.+mimetype', {
  'documents.+mimetype': {
    '$exists': true,
    '$nin': mimetypes
  }
});

// Document types
reportList('events', 'documents.+type', {
  'documents.+type': {
    '$exists': true,
    '$nin': [
      'agenda',
      'full-text',
      'other'
    ]
  }
});

// Related bills types
reportList('events', 'related_bills.type', {
  'related_bills.type': {
    '$exists': true,
    '$nin': [
      'bill',
      'consideration'
    ]
  }
});

// Participant type
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/event.json#L64
reportList('events', 'participants.participant_type ', {
  'participants.participant_type': {
    '$exists': true,
    '$nin': [
      'committee',
      'legislator'
    ]
  }
});

// Participant role
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/event.json#L71
reportList('events', 'participants.type ', {
  'participants.type': {
    '$exists': true,
    '$nin': [
      'chair',
      'committee',
      'host'
    ]
  }
});

// Event types
reportList('events', 'type', {
  type: {
    '$nin': [
      'committee:hearing',
      'committee:meeting',
      'house:session',
      'joint:session',
      'senate:session',
      'floor_time',
      'other',
      'redistricting',
      'special'
    ]
  }
});

// Vote types
// @see https://github.com/sunlightlabs/billy/blob/master/billy/schemas/vote.json#L11
reportList('votes', 'type', {
  type: {
    '$exists': true,
    '$nin': [
      'amendment',
      'other',
      'passage',
      'reading:1',
      'reading:2',
      'reading:3',
      'veto_override'
    ]
  }
});
