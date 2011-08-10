// simple helpers
module.exports.header = function(message) {
  console.log('=== ' + (new Date()).toUTCString() + ' : ' + message);
}

module.exports.body = function(message) {
  
  var statement = (typeof(message) === 'object')
  ? JSON.stringify(message)
  : message;
  
  console.log('\n\t' + statement + '\n');
}
