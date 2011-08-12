// simple helpers
module.exports.header = function(message) {
  console.log('=== ' + (new Date()).toUTCString() + ' : ' + message);
}

module.exports.body = function(message) {
  console.log('\n');
  console.log(message);
  console.log('\n\n');
}
