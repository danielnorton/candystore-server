/**
 * Module dependencies.
 */
var express = require('express');
var app = module.exports = express.createServer();
var config = require('config');
var request = require('request');


// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'Candy Store Services'
  });
});

app.get('/products', function(req, res) {

  var path = config.couch_server + config.databases.products + '/_all_docs?include_docs=true';
  request({uri:path}, function(error, response, body) {

    var raw = JSON.parse(body);
    var rows = raw.rows;
    var answer = [];
    for (var i in rows) {
      
      var row = rows[i].doc;
      delete row._id;
      delete row._rev;
      row.retina_image = '/images/' + row.retina_image;
      row.image = '/images/' + row.image;
      
      answer.push(row);
    }

    res.header('Content-Type', 'application/json');
    res.send(answer);
  });
});
 
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
