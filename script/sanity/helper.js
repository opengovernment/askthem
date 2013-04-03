var verbose;

// Turn off some reports by default.
if (typeof verbose === 'undefined') {
  verbose = false;
}

// Finds documents in the given collection matching the given criteria. If any
// documents are found, prints the given message and, for each document, prints
// its ID and the value of the given field.
var reportList = function (collection, field, criteria, message) {
  message = message || collection + ' with invalid ' + field;

  var count = db[collection].count(criteria);
  if (count) {
    print('\n# ' + message + ':');
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
