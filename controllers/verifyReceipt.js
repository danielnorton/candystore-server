var config = require('config');
var url = require('url');
var request = require('request');
var log = require('../util/simpleLog');
var json = require('../util/jsonHeader');

var sandboxPath = 'https://sandbox.itunes.apple.com/verifyReceipt';
var livePath = 'https://buy.itunes.apple.com/verifyReceipt';

// Verify IAP receipts against iTunes
module.exports = function(req, res) {
    
  var product = JSON.parse(req.rawBody);

  var post = {
    method:'POST',
    json:{
      'receipt-data':product.receipt
    }
  };
  
  if (product.type === 'exchange') {
    
    post.json.password = config.sharedSecret;
  };

  var respond = function(answer) {
  
    log.header('Reply to Client');
    log.body(answer);
    json(res);
    res.send(answer);
  };
  
  var validate = function(path, recurse) {
    
    post.uri = path;
    
    log.header(path);
    log.body(post.json);
    
    request(post, function(error, response, body) {

      var json = JSON.parse(body);
      
      log.header('Apple Response');
      log.body(json);
      
      var codeValue = json.status;
      var transactionIdentifierValue = (json.receipt === undefined)
      ? ''
      : json.receipt.original_transaction_id;
      
      var answer = {code:codeValue, transactionIdentifier:transactionIdentifierValue};

      res.header('Content-Type', 'application/json');
      
      // 21007 = Sandbox receipt sent to production
      //
      // See WWDC 2011 Session 510 by Max Müller
      // - In-App Purchase for iOS and Mac OS X
      //
      // Recommended approach is to always send receipt to production (buy.itunes.com) first.
      // If 21007 comes back, try again with sandbox (sandbox.itunes.com).
      // This is particularly useful while app is in review.
      // 
      if (codeValue === 21007) {
         
        if (recurse) {
          
          validate(sandboxPath, false);
           
        } else {
           
           respond(answer);
        }
        
      } else {

        respond(answer);
      }
    });
  };

  validate(livePath, true);
};