const utils = require('../utils');
module.exports = (RED) => {
  function DeleteNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    this.objectWithoutId = ['apiPermission', 'asset', 'inventoryLevel', 'productListing'];

    this.objectWithoutParams = [
      'apiPermission',
      'article',
      'blog',
      'carrierService',
      'collect',
      'country',
      'customCollection',
      'customer',
      'customerAddress',
      'customerSavedSearch',
      'discountCode',
      'draftOrder',
      'fulfillmentEvent',
      'fulfillmentService',
      'marketingEvent',
      'metafield',
      'order',
      'orderRisk',
      'page',
      'priceRule',
      'product',
      'productImage',
      'productListing',
      'productVariant',
      'recurringApplicationCharge',
      'redirect',
      'report',
      'scriptTag',
      'smartCollection',
      'storefrontAccessToken',
      'theme',
      'webhook',
    ];

    this.objectWithForeignKeys = [
      { name: 'article', params: ['blogId'] },
      { name: 'asset', params: ['themeId'] },
      { name: 'customerAddress', params: ['customerId'] },
      { name: 'discountCode', params: ['priceRuleId'] },
      { name: 'discountCodeCreationJob', params: ['priceRuleId'] },
      { name: 'fulfillmentEvent', params: ['orderId', 'fulfillmentId'] },
      { name: 'orderRisk', params: ['orderId'] },
      { name: 'productImage', params: ['productId'] },
      { name: 'productListing', params: ['productId'] },
      { name: 'productVariant', params: ['productId'] },
    ];

    node.on('input', async (msg, send, done) => {
      // reset status
      node.status({});

      const object = config.object;
      let args = [];

      try {
        if (!msg['_YOU_shopify']) {
          node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_CONNECTION });
          done(new Error(utils.MESSAGE.MISSING_CONNECTION));
          return;
        }

        if (!object) {
          node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_TYPE });
          done(new Error(utils.MESSAGE.MISSING_TYPE));
          return;
        }

        const hasForeignKeys = this.objectWithForeignKeys.find((el) => el.name === object);
        if (hasForeignKeys) {
          if (!config.foreignKeys || Object.keys(config.foreignKeys).length == 0) {
            node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_FOREIGN_KEYS });
            done(new Error(utils.MESSAGE.MISSING_FOREIGN_KEYS));
            return;
          }

          if (!Array.isArray(msg[config.foreignKeys])) {
            msg[config.foreignKeys] = [msg[config.foreignKeys]];
          }

          args.push(...msg[config.foreignKeys]);
        }

        const hasObjectId = !this.objectWithoutId.includes(object);
        if (hasObjectId) {
          const objectId = msg[config.objectId];
          if (!objectId) {
            node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_OBJECT_ID });
            done(new Error(utils.MESSAGE.MISSING_OBJECT_ID));
            return;
          }
          args.push(objectId);
        }

        const hasParams = !this.objectWithoutParams.includes(object);
        if (hasParams) {
          const deleteParams = msg[config.deleteParams];
          if (!deleteParams || Object.keys(deleteParams).length == 0) {
            node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_DELETE_PARAMS });
            done(new Error(utils.MESSAGE.MISSING_DELETE_PARAMS));
            return;
          }
          args.push(deleteParams);
        }

        const result = await msg['_YOU_shopify'][object].delete(...args);

        msg.payload = result;
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
        node.send(msg);
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.ERROR_DURING_DELETE });
        done(error);
      }
    });
  }
  RED.nodes.registerType('delete', DeleteNode);
};
