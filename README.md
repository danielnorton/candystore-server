Candy Store Server
===========

Service back end to a demo iOS app, Candy Store <https://github.com/danielnorton/CandyStore-app>

Dependency
------------

- node.js <http://nodejs.org/>
- npm <http://npmjs.org/>
- couchdb (I have been using couchbase v2.0.0 <http://www.couchbase.com/>)

Setup
------------
Using npm,


    npm install express jade stylus expresso mime qs config request


Databases
------------
Here is some sample data that I am currently working with. Keep in mind that all occurrences of "com.brimstead" are to facilitate _my_ Apple Developer Program subscription. Your identifiers will be different.

- app_products (currently has documents like these)

		{
		   "_id": "da2c6c25e1eded18d293b7e50400151c",
		   "_rev": "3-b50288997bc9d03fcf9e4f1b3053571a",
		   "key": "candy",
		   "identifier": "com.brimstead.candystore.bluecandy",
		   "retina_image": "blueCandy@2x.png",
		   "image": "blueCandy.png"
		}
		
		{
		   "_id": "da2c6c25e1eded18d293b7e504002177",
		   "_rev": "1-941e2159a8b2e7c6836f30e09f15cc26",
		   "key": "exchange",
		   "identifier": "com.brimstead.candystore.exchange",
		   "durations": {
					"com.brimstead.candystore.exchange.7day":"7 Day Subscription",
					"com.brimstead.candystore.exchange.6mo":"6 Month Subscription",
					"com.brimstead.candystore.exchange.1yr":"1 Year Subscription"
		   },
		   "retina_image": "exchange@2x.png",
		   "image": "exchange.png"
		}
		
		{
		   "_id": "da2c6c25e1eded18d293b7e5040027e4",
		   "_rev": "4-655616b4eb8393e57c03517816873e42",
		   "key": "bigcandyjar",
		   "identifier": "com.brimstead.candystore.bigcandyjar",
		   "retina_image": "bigCandyJar@2x.png",
		   "image": "bigCandyJar.png"
		}