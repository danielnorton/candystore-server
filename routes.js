module.exports = function(app) {
  app.get('/', require('./controllers/index'));
  app.get('/products', require('./controllers/products'));
  app.post('/verifyReceipt', require('./controllers/verifyReceipt'));
  
  app.get('/exchange', require('./controllers/exchange').getcandy);  
  app.get('/exchange/:exchangeTransactionIdentifier', require('./controllers/exchange').get);
  app.put('/exchange', require('./controllers/exchange').put);
  app.post('/exchange', require('./controllers/exchange').post);
};