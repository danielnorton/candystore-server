var request = require('request');
var config = require('config');
var step = require('../util/step');
var json = require('../util/jsonHeader');
var log = require('../util/simpleLog');


// Returns productIdentifier and count of each candy in Exchange.
// See couchdb/exchange/views.txt allcandyview for example of map/reduce
module.exports.getcandy = function(req, res) {

  var path = config.couch_server + config.databases.exchange + '/_design/candy/_view/allcandyview?group=true';
  var post = {
    uri: path,
    method: 'get'
  };
  
  log.header('GET /exchange/:id : ' + path);
  request(post, function(error, response, body) {
    
    var rows = JSON.parse(body).rows;
    json(res);
    res.send(rows);
  });
};


// Gets count of Exchange records for a single Exchange subscription transactionIdentifier
module.exports.get = function(req, res) {
  
  console.log(req.params);
  
  var transactionIdentifier = req.params.exchangeTransactionIdentifier;
  
  var path = config.couch_server + config.databases.exchange + '/_design/customers/_view/customersview?key=%22' + transactionIdentifier + '%22';
  var post = {
    uri: path,
    method: 'get'
  };
  
  log.header('GET /exchange : ' + path);
  request(post, function(error, response, body) {
    
    json(res);
    
    var rows = JSON.parse(body).rows;
    var credits = (rows.length > 0)
    ? rows.length - 1
    : 0;
    
    var answer = {
      'exchangeTransactionIdentifier':transactionIdentifier,
      'credits':credits
    };
    res.send(answer);
  });
};


// Creates a record for the customer's Exchange receipt and for a
// candy receipt they would like to apply to their Exchange account as a credit.
// If either of these records alrady exists, it will not duplicate them.
module.exports.put = function(req, res) {
  
  var transaction = JSON.parse(req.rawBody);
  transaction.code = 0;
  
  step(
    
    
    // Verify the receipts with Apple
    function buildVerify() {

      var path = config.local_root + '/verifyReceipt';
      var exchangePost = {
        uri: path,
        method:'POST',
        json:{
          'receipt':transaction.exchange.receipt,
          'type':'exchange'
        }
      };
      
      var candyPost = {
        uri: path,
        method:'POST',
        json:{
          'receipt':transaction.candy.receipt
        }
      };
      
      // log.header('buildVerify');
      // log.body(exchangePost);
      // log.body(candyPost);
      
      request(exchangePost, this.parallel());
      request(candyPost, this.parallel());
    },


    // Process result of verification checks
    function receiveVerify(err, exchangeRaw, candyRaw) {
      
      if (err) throw err;
      
      var exchange = JSON.parse(exchangeRaw.body);
      var candy = JSON.parse(candyRaw.body);
      
      transaction.code = exchange.code;
      if (exchange.code === 21006) {
        
        throw 'Exchange subscription is expired';
        
      } else if (exchange.code !== 0) {
        
        throw 'Invalid Exchange subscription';
        
      } else if (candy.code !== 0) {
        
        throw 'Invalid Candy';
      }
      
      transaction.exchange.transactionIdentifier = exchange.transactionIdentifier;
      transaction.candy.transactionIdentifier = candy.transactionIdentifier;

       var path = config.couch_server + config.databases.exchange + '/_design/customers/_view/customersview?key=%22' + exchange.transactionIdentifier + '%22';
        var post = {
          uri: path,
          method:'GET'
        };
        
        log.header('receiveVerify');
        log.body(post);
        request(post, this);
    },
    
    
    // Create database records if they do not already exist
    function createRecords(err, recordsRaw) {
      
      if (err) throw err;
      
      var records = JSON.parse(recordsRaw.body);
      
      var exchangeRecordId = undefined;
      var candyRecordId = undefined;
      
      for(var i in records.rows) {
        
        var row = records.rows[i];
        var type = row.value.type;
        if (type === 'customer') {
          
          exchangeRecordId = row.id;
        };
        
        if ((type === 'candy') && (row.value.receipt === transaction.candy.receipt)) {
          
          candyRecordId = row.id;
        };
      };

      if (exchangeRecordId === undefined) {
        
        var path = config.couch_server + config.databases.exchange;
        var post = {
          uri: path,
          method: 'POST',
          json: {
            'type': 'customer',
            'transactionIdentifier': transaction.exchange.transactionIdentifier,
            'receipt': transaction.exchange.receipt
          }
        };
        
        log.header('create exchange record');
        log.body(post);
        request(post, this.parallel());
      
      } else {
        
        var path = config.couch_server + config.databases.exchange + '/' + exchangeRecordId;
        var post = {
          uri: path,
          method: 'GET'
        };
        request(post, this.parallel());
      };
      
      if (candyRecordId === undefined) {
        
        var path = config.couch_server + config.databases.exchange;
        var post = {
          uri: path,
          method: 'POST',
          json: {
            'type': 'candy',
            'exchangeTransactionIdentifier': transaction.exchange.transactionIdentifier,
            'transactionIdentifier':transaction.candy.transactionIdentifier,
            'productIdentifier':transaction.candy.productIdentifier,
            'receipt': transaction.candy.receipt
          }
        };
        
        log.header('create candy record');
        log.body(post);
        request(post, this.parallel());
        
      } else {
        
        var path = config.couch_server + config.databases.exchange + '/' + candyRecordId;
        var post = {
          uri: path,
          method: 'GET'
        };
        request(post, this.parallel());
      };
    },
    
    
    // Get new exchange count for user to pass to final response
    function getNewExchangeCount(err, exchange, candy) {
      
      if (err) throw err;
      
      log.header('PUT exchange getNewExchangeCount');
      
      var path = config.local_root + '/exchange/' + transaction.exchange.transactionIdentifier;
      var post = {
        uri: path,
        method: 'GET'
      };
      
      log.body(post);
      request(post, this);
    },
    
    
    // Package up the response and send it to the caller
    function sendAnswer(err, countRaw) {

      var newReceipt = { 'code': transaction.code };
      if (err) {
        
        newReceipt.description = err;
        
      } else {
        
        var count = JSON.parse(countRaw.body);        
        newReceipt.exchange = count;
      }
      
      json(res);
      res.send(newReceipt);
    }
  );
};


// Use an Exchange credit. Should decrement the caller's exchange credit count
// and return a candy receipt to be stored on the client
module.exports.post = function(req, res) {
  
  var transaction = JSON.parse(req.rawBody);
  transaction.code = 0;
  
  step(
    
    
    // Verify the receipts with Apple
    function buildVerify() {

      var verifyPath = config.local_root + '/verifyReceipt';
      var exchangePost = {
        uri: verifyPath,
        method:'POST',
        json:{
          'receipt':transaction.exchange.receipt,
          'type':'exchange'
        }
      };
      request(exchangePost, this.parallel());
      
      
      var candyCountPath = config.couch_server + config.databases.exchange + '/_design/candy/_view/allcandyview?group=true&key=%22' + transaction.candy.productIdentifier + '%22';
      var candyCountPost = {
        uri: candyCountPath,
        method:'GET'
      };
      request(candyCountPost, this.parallel());     
    },


    // Process result of verification checks
    function receiveVerify(err, exchangeRaw, countRaw) {

      if (err) throw err;
      
      var exchange = JSON.parse(exchangeRaw.body);
      var candy = JSON.parse(countRaw.body).rows;
      
      log.header('post receiveVerify');
      log.body(exchange);
      log.body(candy);
      
      transaction.code = exchange.code;
      if (!((exchange.code === 0) || (exchange.code === 21006))) {
        
        throw 'Invalid Exchange subscription';
        
      }  else if (candy.length === 0) {

          throw 'Invalid Candy';
      }
      
      transaction.exchange.transactionIdentifier = exchange.transactionIdentifier;
     
      var path = config.couch_server + config.databases.exchange + '/_design/customers/_view/customersview?key=%22' + exchange.transactionIdentifier + '%22';
      var post = {
        uri: path,
        method:'GET'
      };
      request(post, this.parallel());
      
      var allCandyPath = config.couch_server + config.databases.exchange + '/_design/candy/_view/candy_records?key=%22' + transaction.candy.productIdentifier + '%22';
      var allCandyPost = {
        uri: allCandyPath,
        method:'GET'
      };
      request(allCandyPost, this.parallel());
    },
    
    
    // Confirm records are in the database
    function recordVerify(err, recordRaw, allCandyRaw) {
      
       if (err) throw err;
       
       var exchange = JSON.parse(recordRaw.body);
       var availableCandy = JSON.parse(allCandyRaw.body).rows;
       
       log.header('post recordVerify');
       log.body(exchange);
       log.body(availableCandy);
       
       if (exchange.rows.length === 0) {
         
         transaction.code = -1;
         throw "Invalid Exchange record";
       };
       
       if (exchange.rows.length < 2) {

         transaction.code = -1;
         throw "Not enough Exchange credits";
       };
       
       // Try to find a candy record in the caller's credits to use for the exchange transaction
       var match = undefined;
       var trade = undefined;
       for (var i in exchange.rows) {

         match = exchange.rows[i];
         if (match.value.type === 'candy') {
           
           trade = match;
           if (match.value.productIdentifier === transaction.candy.productIdentifier) {
             
             break;
             
           } else {
             
             match = undefined;
           }
           
         } else {

           match = undefined;
         }
       };
       
       // If there is a match in credits the user has previously submitted
       // then just use that record. Delete the record from the database and
       // pass the receipt and productIdentifier back to the client
       if (match !== undefined) {
         
         transaction.answer = {
            'transactionIdentifier' : match.value.transactionIdentifier,
            'productIdentifier' : match.value.productIdentifier,
            'receipt' : match.value.receipt
          };
          
          var path = config.couch_server + config.databases.exchange + '/' + match.id + '?rev=' + match.value._rev;
          var post = {
            uri: path,
            method:'DELETE'
          };
          request(post, this);
          
          log.header('POST exchange consuming customer candy');
          log.body(post);
          
          
       // If there is not a match, then use 'trade'. Trade is just any one
       // record in the caller's current credit count. In this case, find any
       // other candy record in the database that matches the requested productIdentifier
       // delete that one from the database, pass its info back to the caller, and also
       // give the trade record to whomever just lost the one that was deleted.
       } else if (trade !== undefined) {
         
         var otherTrade = availableCandy[0];
         transaction.answer = {
             'transactionIdentifier' : otherTrade.value.transactionIdentifier,
             'productIdentifier' : otherTrade.value.productIdentifier,
             'receipt' : otherTrade.value.receipt
         };
         
         var newTrade = {
           
           '_id': trade.id,
           '_rev': trade.value._rev,
           'type': trade.value.type,
           'exchangeTransactionIdentifier': otherTrade.value.exchangeTransactionIdentifier,
           'productIdentifier': trade.value.productIdentifier,
           'receipt': trade.value.receipt
         }
         
         var updatePath = config.couch_server + config.databases.exchange + '/' + trade.id;
         var updatePost = {
           uri: updatePath,
           method:'PUT',
           json:newTrade
         };
         request(updatePost, this.parallel());
         
         var deletePath = config.couch_server + config.databases.exchange + '/' + otherTrade.id + '?rev=' + otherTrade.value._rev;;
         var deletePost = {
           uri: deletePath,
           method:'DELETE'
         };
         request(deletePost, this.parallel());
         
         log.header('POST exchange trading');
         log.body(updatePost);
         log.body(deletePost);
         
       } else {
         
         transaction.code = -1;
         throw 'No trade candy is available';
       }
       
       console.log(transaction.answer);
    },
    
    
    // Package up the response and send it to the caller
    function sendAnswer(err) {
    
      var newReceipt = { 'code': transaction.code };
      if (err) {
        
        newReceipt.description = err;
        
      } else {
        
        newReceipt.candy = transaction.answer;
      }
      
      json(res);
      res.send(newReceipt);
    }
  );
};