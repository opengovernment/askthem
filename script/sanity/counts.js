reportList('votes', 'yes_count', {
  '$where': function () {
    return this.yes_count != this.yes_votes.length;
  }
});

reportList('votes', 'no_count', {
  '$where': function () {
    return this.no_count != this.no_votes.length;
  }
});

reportList('votes', 'other_count', {
  '$where': function () {
    return this.other_count != this.other_votes.length;
  }
});

reportList('votes', '+absent', {
  '+absent': {
    '$exists': true
  },
  '+AB': {
    '$exists': true
  },
  '$where': function () {
    return this['+absent'] != this['+AB'].length;
  }
});

reportList('votes', '+excused', {
  '+excused': {
    '$exists': true
  },
  '$where': function () {
    if (this['+E']) {
      return this['+excused'] != this['+E'].length;
    }
    else if (this['+EXC']) {
      return this['+excused'] != this['+EXC'].length;
    }
  }
});

reportList('votes', '+not_voting', {
  '+not_voting': {
    '$exists': true
  },
  '+NV': {
    '$exists': true
  },
  '$where': function () {
    return this['+not_voting'] != this['+NV'].length;
  }
});

reportList('votes', '+present', {
  '+present': {
    '$exists': true
  },
  '+P': {
    '$exists': true
  },
  '$where': function () {
    return this['+present'] != this['+P'].length;
  }
});

reportList('votes', '+vacant', {
  '+vacant': {
    '$exists': true
  },
  '+V': {
    '$exists': true
  },
  '$where': function () {
    return this['+vacant'] != this['+V'].length;
  }
});
