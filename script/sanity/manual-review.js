// Used as part of a poor man's sprintf to align party counts.
var pad = '                                        ';

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

print('\nDistinct members.roles for manual review:');
db.committees.mapReduce(function () {
  this.members.forEach(function (member) {
    emit(member.role, 1);
  });
}, function (key, values) {
  return Array.sum(values);
}, {out: {inline: 1}}).results.forEach(function (result) {
  print(result._id + pad.substring(0, 40 - result._id.length) + result.value);
});
