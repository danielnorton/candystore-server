var config = require('config');

module.exports = function(req, res) {
  res.render('index', {
    title: 'Candy Store Services'
  });
};