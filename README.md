# Candy Store Server

Service back end to a demo iOS app, Candy Store <https://github.com/danielnorton/CandyStore-app>

## Dependency

- node.js <http://nodejs.org/>
- npm <http://npmjs.org/>
- couchdb (I have been using couchbase v2.0.0 <http://www.couchbase.com/>)

## Quick Reference Setup
If you are already a node & couch ninja, this might be all you need

### npm
    npm install express jade stylus expresso mime qs config request

### Databases
There is seed data for the two databases used in the app. Keep in mind that all occurrences of "com.brimstead" are to facilitate _my_ Apple Developer Program subscription. Your identifiers will be different.
	
- app_products
	- Create the database
	- Create a document for each of the items in /couchdb/app_products/documents.txt
	
- exchange
	- Create the database
	- create two views based on the contents of /couchdb/exchange/views.txt
		
## Detailed Setup Instructions

Assuming a completely clean box without Node or Couch installed, these steps should guide you through the installation process.

 1. **Download and install Node.js**

    - It is probably best to follow the detailed instructions directly from Node on github. Candy Store server is built using v0.4.11. The most up to date information on how to install node is on github [here](https://github.com/joyent/node/wiki/Installation).

    - Also install **nodemon**. Follow the README directions [here](https://github.com/remy/nodemon).

 1. **Download and configure Couchbase**

    I had a hard time getting a package managed install of couch to work. I believe that has since been fixed. However, I am very happy with Couchbase. It was trivial to get setup. Some of the instructions below ask you to manually add documents and views to the databases. I'm not sending you down the path of manually doing this in Futon, the couch admin console, to help you learn it. I'm just to lazy at this moment to write a setup script.

    - Download the free Couchbase Single Server Community Edition from [here](http://www.couchbase.com/downloads).
    - If you would like, copy the file to your Applications directory.
    - Run the app. This should cause a new icon to appear in the menu bar and cause a browser to launch the Futon management console.
    - Take note of the address of your local couchdb instance. For example, my local instance happens to be **http://127.0.0.1:5984**. Let's call this address **%couchdb%**.
    - In Futon:
        - Tap **Create Database...**
            - Database Name: **app_products**
            - OK.
        - Tap the new database, **app_products**
        - Inside the root directory of this node project is a directory named couchdb. This directory holds configuration files for each of the databases. Open the file /couchdb/app_products/documents.txt.
        - For each of the javascript elements in this document:
            - Tap **New Document**. This will open a document editor that is pre-populated with a document id ("_id").
            - Double tap the placeholder document to edit it.
            - Paste the Candy Store javascript document into the editor, keeping the pre-populated document id. Also replace _com.brimstead_ with your own reverse DNS name. For example, if your reverse DNS name is com.initech, the first javascript document should look something like this in the editor:

    				{
						   "_id": "8bf9ab1ce875279750cf59b06e000df8",
						   "key": "candy",
						   "identifier": "com.initech.candystore.purplecandy",
						   "retina_image": "purpleCandy@2x.png",
						   "image": "purpleCandy.png"
    				}

            - Tap **Save Document**
            - Do this for each document in the documents.txt file.
            - Test. Open **%couchdb%**/app&#95;products/&#95;all&#95;docs (aka: http://127.0.0.1:5984/app&#95;products/&#95;all&#95;docs). You should see something similarly structured to this:

    				{"total_rows":7,"offset":0,"rows":[
    				{"id":"032f54fa14b90ae9d19d67cc3d005410","key":"032f54fa14b90ae9d19d67cc3d005410","value":{"rev":"1-ff96e4a74695f20e6d5ab07ac58f5f54"}},
    				{"id":"032f54fa14b90ae9d19d67cc3d00553d","key":"032f54fa14b90ae9d19d67cc3d00553d","value":{"rev":"1-5ccbe46acc09fa34ac5e0b2ae46d406b"}},
    				{"id":"032f54fa14b90ae9d19d67cc3d00600f","key":"032f54fa14b90ae9d19d67cc3d00600f","value":{"rev":"1-29d565c0ee276589e19f44bff46a8570"}},
    				{"id":"7c026fd10a13d63b94ce85e16300094b","key":"7c026fd10a13d63b94ce85e16300094b","value":{"rev":"3-2c2a0f7a5716e55edb128e09484ae120"}},
    				{"id":"da2c6c25e1eded18d293b7e50400151c","key":"da2c6c25e1eded18d293b7e50400151c","value":{"rev":"5-ebf30e31a70165a581dfdcbf85c31232"}},
    				{"id":"da2c6c25e1eded18d293b7e504002177","key":"da2c6c25e1eded18d293b7e504002177","value":{"rev":"7-347824442583c539db576793b1876727"}},
    				{"id":"da2c6c25e1eded18d293b7e5040027e4","key":"da2c6c25e1eded18d293b7e5040027e4","value":{"rev":"4-655616b4eb8393e57c03517816873e42"}}
    				]}

        - Tap **Overview** to get out to the list of databases
        - Tap **Create Database...**
            - Database Name: **exchange**
            - OK.
		        - Tap the new database, **exchange**
		        - Inside the root directory of this node project is a directory named couchdb. This directory holds configuration files for each of the databases. Open the file /couchdb/exchange/views.txt.
		        - For each of the javascript elements in this document:
            - In the **View** dropdown to the right, select **Temporary View**
						 - Tap **New Document**. This will open a document editor that is pre-populated with a document id ("_id").
	            - Double tap the placeholder document to edit it.
	            - Paste the Candy Store javascript document into the editor, _REPLACING_ the pre-populated document id. Each new document should match its counterpart in views.txt exactly.
            - Test. Open **%couchdb%**/exchange/&#95;design/candy/&#95;view/candy&#95;records (aka: http://127.0.0.1:5984/exchange/&#95;design/candy/&#95;view/candy&#95;records). You should see something similarly structured to this:

    				{"total_rows":0,"offset":0,"rows":[]}
	
 1. **Relax**

    Congratulations! You have configured CouchDB for the Candy Store server. Keep note of the **%couchdb%** address. It will be needed in the node project configuration.

 1. **Configure the app**

    - From the root of the project, edit the file /config/default.json
    - Change the address (but not the port) of **local&#95;root** to match your computer. Let's call this **%node%**
    - Change **couch&#95;server** to match **%couchdb%**
    - Save your changes

    - Open Termninal and navigate to the root directory of this project
    - Type:

		    npm install express jade stylus expresso mime qs config request

    - This might take a while and spit out a bunch of text to the Terminal.
    - Shut down terminal

 1. **Run the app**

    - Open Termninal and navigate to the root directory of this project
    - Type:

		    nodemon app.js

    - You should see an output similar to this:

            19 Aug 15:22:47 - [nodemon] v0.5.3
            19 Aug 15:22:47 - [nodemon] watching: /Users/danielnorton/Projects/devLink/2011/candystore-server
            19 Aug 15:22:47 - [nodemon] running app.js
            19 Aug 15:22:47 - [nodemon] starting node
            Express server listening on port 3000 in development mode

    - Test. Open **%node%**/products (aka http://daniels-lappy.local:3000/products). Excepting your reverse DNS entries, you should see something similarly structured to this:

            [{"key":"candy","identifier":"com.brimstead.candystore.purplecandy","retina_image":"/images/purpleCandy@2x.png","image":"/images/purpleCandy.png"},{"key":"candy","identifier":"com.brimstead.candystore.greencandy","retina_image":"/images/greenCandy@2x.png","image":"/images/greenCandy.png"},{"key":"candy","identifier":"com.brimstead.candystore.redcandy","retina_image":"/images/redCandy@2x.png","image":"/images/redCandy.png"},{"key":"candy","identifier":"com.brimstead.candystore.orangecandy","retina_image":"/images/orangeCandy@2x.png","image":"/images/orangeCandy.png"},{"key":"candy","identifier":"com.brimstead.candystore.bluecandy","retina_image":"/images/blueCandy@2x.png","image":"/images/blueCandy.png"},{"key":"exchange","identifier":"com.brimstead.candystore.exchange","durations":{"com.brimstead.candystore.exchange.7day":"7 Day Subscription","com.brimstead.candystore.exchange.6mo":"6 Month Subscription","com.brimstead.candystore.exchange.1yr":"1 Year Subscription"},"retina_image":"/images/exchange@2x.png","image":"/images/exchange.png"},{"key":"bigcandyjar","identifier":"com.brimstead.candystore.bigcandyjar","retina_image":"/images/bigCandyJar@2x.png","image":"/images/bigCandyJar.png"}]

 1. **Done**
    - Hooray! It works. Keep **%node%** handy. You will need that to configure your iOS client.