// legislators: roles.state and state
reportList('legislators', 'state', {
  roles: {
    '$ne': [],
  },
  '$where': function () {
    for (var i = 0, l = this.roles.length; i < l; i++) {
      var value = this.roles[i].state;
      if (value != this.state) {
        return true;
      }
    }
  },
}, "legislators with a role whose state is not the legislator's state");

// legislators: roles.chamber and chamber
reportList('legislators', 'chamber', {
  roles: {
    '$ne': [],
  },
  '$where': function () {
    for (var i = 0, l = this.roles.length; i < l; i++) {
      var value = this.roles[i].chamber;
      if (this.active && value != 'joint' && value != this.chamber) {
        return true;
      }
    }
  },
}, "legislators with a role whose chamber is neither 'joint' nor the legislator's chamber");

// legislators: roles.district and district
reportList('legislators', 'district', {
  'roles.district': {
    '$exists': true,
  },
  '$where': function () {
    for (var i = 0, l = this.roles.length; i < l; i++) {
      var value = this.roles[i].district;
      if (this.active && value && value != this.district) {
        return true;
      }
    }
  },
}, "legislators with a role whose district is not the legislator's district");

// legislators: roles.party and party
reportList('legislators', 'party', {
  'roles.party': {
    '$exists': true,
  },
  '$where': function () {
    for (var i = 0, l = this.roles.length; i < l; i++) {
      var value = this.roles[i].party;
      if (value && value != this.party) {
        return true;
      }
    }
  },
}, "legislators with a role whose party is not the legislator's party");

// legislators#roles.committee and committees#committee
// legislators#roles.subcommittee and committees#subcommittee
reportList('legislators', 'roles.committee_id', {
  'roles.committee_id': {
    '$exists': true,
  },
  '$where': function () {
    for (var i = 0, l = this.roles.length; i < l; i++) {
      var id = this.roles[i].committee_id;
      if (id) {
        if (this.roles[i].subcommittee) {
          var subcommittee = db.committees.findOne({_all_ids: id});
          if (subcommittee) {
            var committee = db.committees.findOne({_all_ids: subcommittee.parent_id});
            if (this.roles[i].subcommittee != subcommittee.subcommittee) {
              return true;
            }
            if (this.roles[i].committee != committee.committee) {
              return true;
            }
          }
        }
        else if (this.roles[i].committee) {
          var committee = db.committees.findOne({_all_ids: id});
          if (committee) {
            if (this.roles[i].committee != committee.committee) {
              return true;
            }
          }
        }
      }
    }
  },
}, "legislators with a role whose committee name is not the committee's name");

// legislators#roles.position and committees#members.role
reportList('legislators', 'roles.committee_id', {
  'roles.committee_id': {
    '$exists': true,
  },
  '$where': function () {
    for (var i = 0, l = this.roles.length; i < l; i++) {
      var value = this.roles[i].position;
      if (value) {
        var id = this.roles[i].committee_id;
        if (id) {
          var document = db.committees.findOne({_all_ids: id});
          if (document) {
            for (var j = 0, m = document.members.length; j < m; j++) {
              if (document.members[j].leg_id === this._id) {
                if (document.members[j].role != value) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
  },
}, "legislators with a role whose position is not their position on the committee");

// bills#companions.bill_id and bills#bill_id through bills#companions.internal_id
// @note Very long running time.
if (false) {
  reportList('bills', 'companions.internal_id', {
    'companions.internal_id': {
      '$exists': true,
    },
    '$where': function () {
      for (var i = 0, l = this.companions.length; i < l; i++) {
        var id = this.companions[i].internal_id;
        if (id) {
          var document = db.bills.findOne({_all_ids: id});
          if (document) {
            if (this.companions[i].bill_id != document.bill_id) {
              return true;
            }
          }
        }
      }
    },
  }, "bills with a companion whose bill ID is not the bill's bill ID");  
}

// bills#actions.related_entities.name and legislators#full_name or committees#committee or committees#subcommittee
/*
reportList('bills', 'actions.related_entities.id', {
  'actions.related_entities.id': {
    '$ne': null,
  },
  '$where': function () {
    for (var i = 0, l = this.actions.length; i < l; i++) {
      if (this.actions[i].related_entities) {
        for (var j = 0, m = this.actions[i].related_entities.length; j < m; j++) {
          // @todo
        }
      }
    }
  },
});
*/

// committees#members.name and legislators#full_name
if (verbose) {
  // @note It's common for names to differ, e.g. "James Doe" versus "Jim Doe".
  reportList('committees', 'members.leg_id', {
    'members.leg_id': {
      '$ne': null,
    },
    '$where': function () {
      for (var i = 0, l = this.members.length; i < l; i++) {
        var id = this.members[i].leg_id;
        if (id) {
          var document = db.legislators.findOne({_all_ids: id});
          if (document) {
            if (this.members[i].name != document.full_name) {
              return true;
            }
          }
        }
      }
    },
  }, "committees with a member whose name is not the legislator's name");
}



// bills: sponsors.chamber and chamber
// @todo It seems common practice in some states for representatives to be
//   primary on a bill and for a senator to be cosponsor. Needs clarification.
if (false) {
  reportList('bills', 'chamber', {
    'sponsors.chamber': {
      '$exists': true,
    },
    '$where': function () {
      for (var i = 0, l = this.sponsors.length; i < l; i++) {
        var value = this.sponsors[i].chamber;
        if (value && value != this.chamber) {
          return true;
        }
      }
    },
  }, "bills with a sponsor whose chamber is not the bill's chamber");
}

// bills#actions._scraped_committee_name and committees#subcommittee or committees#subcommittee
// @note Scraped committee names are not meant to match committee names.
if (false) {
  reportList('bills', 'actions.committee', {
    'actions.committee': {
      '$exists': true,
    },
    '$where': function () {
      for (var i = 0, l = this.actions.length; i < l; i++) {
        var id = this.actions[i].committee;
        if (id) {
          var document = db.committees.findOne({_all_ids: id});
          if (document) {
            var value = this.actions[i]._scraped_committee_name;
            if (value != document.committee && value != document.subcommittee) {
              return true;
            }
          }
        }
      }
    },
  }, "bills with an action whose committee name is not the committee's name");  
}
