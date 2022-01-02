const utils = require('../utils');
module.exports = (RED) => {
  function GetNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    this.objectWithoutId = ['asset', 'checkout', 'productListing', 'shop'];

    this.objectWithoutParams = [
      'accessScope',
      'balance',
      'carrierService',
      'currency',
      'discountCode',
      'giftCardAdjustment',
      'location',
      'orderRisk',
      'productResourceFeedback',
      'resourceFeedback',
      'storefrontAccessToken',
      'storefrontAccessToken',
    ];

    this.objectWithForeignKeys = [
      { name: 'article', params: ['blogId'] },
      { name: 'asset', params: ['themeId'] },
      { name: 'customerAddress', params: ['customerId'] },
      { name: 'discountCode', params: ['priceRuleId'] },
      { name: 'discountCodeCreationJob', params: ['priceRuleId'] },
      { name: 'fulfillment', params: ['orderId'] },
      { name: 'fulfillmentEvent', params: ['orderId', 'fulfillmentId'] },
      { name: 'giftCardAdjustment', params: ['giftCardId'] },
      { name: 'orderRisk', params: ['orderId'] },
      { name: 'payment', params: ['checkoutToken'] },
      { name: 'productImage', params: ['productId'] },
      { name: 'productListing', params: ['productId'] },
      { name: 'productResourceFeedback', params: ['productId'] },
      { name: 'productVariant', params: ['productId'] },
      { name: 'province', params: ['countryId'] },
      { name: 'refund', params: ['orderId'] },
      { name: 'transaction', params: ['orderId'] },
      { name: 'usageCharge', params: ['recurringApplicationChargeId'] },
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
          try {
            if (!config.getParams || Object.keys(config.getParams).length == 0) {
              config.getParams = 'params = []';
            }
            const getParams = eval(config.getParams);
            args.push(getParams);
          } catch (error) {
            node.status({ fill: 'red', shape: 'dot', text: 'Get params editor error' });
            done(error);
          }
        }

        // if (config.getParams) {
        //   try {
        //     getParams = eval(config.getParams);
        //   } catch (error) {
        //     node.status({ fill: 'red', shape: 'dot', text: 'Get params editor error' });
        //     done(error);
        //   }
        // }

        // let objectId = msg[config.objectId];

        // if (!objectId) {
        //   node.status({ fill: 'red', shape: 'dot', text: 'Objectid is necessary' });
        //   return;
        // }

        // const foreignKeys = this.objectWithForeignKeys.find((el) => el.name === object);

        // if (foreignKeys) {
        //   if (!Array.isArray(msg[config.foreignKeys])) {
        //     msg[config.foreignKeys] = [msg[config.foreignKeys]];
        //   }

        //   const results = await msg['_YOU_shopify'][object].get(...msg[config.foreignKeys], objectId, getParams);

        //   msg.payload = results;
        //   node.send([msg, []]);
        //   return;
        // }

        // const results = await msg['_YOU_shopify'][object].get(objectId, getParams);
        // msg.payload = results;
        // node.send(msg);
        // return;

        const result = await msg['_YOU_shopify'][object].get(...args);

        msg.payload = result;
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
        node.send(msg);
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.ERROR_DURING_GET });
        done(error);
      }
    });
  }
  RED.nodes.registerType('get', GetNode);
};
