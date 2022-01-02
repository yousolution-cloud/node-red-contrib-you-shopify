const utils = require('../utils');
module.exports = (RED) => {
  function UpdateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    this.objectWithoutId = ['asset', 'checkout'];

    this.objectWithForeignKeys = [
      { name: 'article', params: ['blogId'] },
      { name: 'asset', params: ['themeId'] },
      { name: 'checkout', params: ['token'] },
      { name: 'customerAddress', params: ['customerId'] },
      { name: 'discountCode', params: ['priceRuleId'] },
      { name: 'fulfillment', params: ['orderId'] },
      { name: 'fulfillmentEvent', params: ['orderId', 'fulfillmentId'] },
      { name: 'orderRisk', params: ['orderId'] },
      { name: 'productImage', params: ['productId'] },
      { name: 'productResourceFeedback', params: ['productId'] },
      { name: 'province', params: ['countryId'] },
    ];

    node.on('input', async (msg, send, done) => {
      // reset status
      node.status({});

      const object = config.object;
      const updateParams = msg[config.updateParams];
      let args = [];

      try {
        if (!msg['_YOU_shopify'] || Object.keys(msg['_YOU_shopify']).length == 0) {
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

        // params
        if (!updateParams || Object.keys(updateParams).length == 0) {
          node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_UPDATE_PARAMS });
          done(new Error(utils.MESSAGE.MISSING_UPDATE_PARAMS));
          return;
          // config.updateParams = 'params = []';
        }
        // const updateParams = eval(config.updateParams);
        args.push(updateParams);

        const result = await msg['_YOU_shopify'][object].update(...args);

        msg.payload = result;
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
        node.send(msg);
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.ERROR_DURING_UPDATE });
        done(error);
      }
    });
  }
  RED.nodes.registerType('update', UpdateNode);
};
