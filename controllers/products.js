var config = require('config');
var request = require('request');
var json = require('../util/jsonHeader');

// Returns a list of all products available for purchase through IAP
module.exports = function(req, res) {

  var path = config.couch_server + config.databases.products + '/_all_docs?include_docs=true';
  request({uri:path}, function(error, response, body) {

    var raw = JSON.parse(body);
    var rows = raw.rows;
    var answer = [];
    for (var i in rows) {
      
      
      // strip out couchdb info and add image paths
      // to returned dictionary
      var row = rows[i].doc;
      delete row._id;
      delete row._rev;
      row.retina_image = '/images/' + row.retina_image;
      row.image = '/images/' + row.image;
      
      answer.push(row);
    }

    json(res);
    res.send(answer);
  });
}