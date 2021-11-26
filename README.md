<!-- [![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url] -->

# Unofficial Shopify API nodes for Node-RED.
[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)


This module provides a set of nodes for Node-RED to quickly create integration flows with Shopify API.

# Installation
[![NPM](https://nodei.co/npm/node-red-contrib-you-shopify.png?downloads=true)](https://nodei.co/npm/node-red-contrib-you-shopify/)

You can install the nodes using node-red's "Manage palette" in the side bar.

Or run the following command in the root directory of your Node-RED installation

    npm install node-red-contrib-you-shopify --save
****

# Dependencies
The nodes are tested with `Node.js v12.22.6` and `Node-RED v2.0.6`.
 - [shopify-api-node](https://github.com/MONEI/Shopify-api-node)

# Changelog
Changes can be followed [here](/CHANGELOG.md).

# Usage
## Basics

### Authenticate

Use this node to authenticate with a valid Shopify API access\
The node requires the following credentials:
- shop name
- api key
- password

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)*

### Retrieve a list of objects

Use this node to retrieve a list of objects
1. Select the type of object you want to retrieve as a list
2. If you want to add filter/options use params

An example for retrieve from customer only *id* and *email* fields:
```javascript
{fields: ['id','email']}
```

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)* 

### Get single object

Use this node to get a single object by providing the primary key
1. Select the type of object you want to retrieve
2. Use *objectId* as primary key of object
3. Use *params* to filter the response fields.

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)* 

### Create a new object

Use this node to create a new object.
1. Select the type of object you want to create
2. Use *msg.foreignKeys* to provide foreign keys *(optional)*
3. Use *msg.createParams* to provide object params

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)* 

### Update an object

Use this node to update an object.
1. Select the type of object you want to update
2. Use *objectId* as primary key of object
3. Use *msg.updateParams* to provide object params

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)* 

### Delete an Object

Use this node to delete an object.
1. Select the type of object you want to delete
2. Use *objectId* as primary key of object

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)* 
  
### Count the number of objects per type

Use this node to count the number of objects per type.
1. Select the type of object you want to count

You can see how to use it in the example flows in the */examples* directory.\
*For more details see official [Shopify API documentation](https://shopify.dev/api/admin-rest)* 




