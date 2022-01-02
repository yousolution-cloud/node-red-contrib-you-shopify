const utils = require('../utils');
module.exports = (RED) => {
  function CreateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.status({});

    this.objectWithForeignKeys = [
      { name: 'article', params: ['blogId'] },
      { name: 'asset', params: ['themeId'] },
      { name: 'cancellationRequest', params: ['fulfillmentOrderId'] },
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
      { name: 'refund', params: ['orderId'] },
      { name: 'transaction', params: ['orderId'] },
      { name: 'usageCharge', params: ['recurringApplicationChargeId'] },
    ];

    node.on('input', async (msg, send, done) => {
      try {
        const createParams = msg[config.createParams];
        const object = config.object;

        // reset status
        node.status({});

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

        if (!createParams) {
          node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.MISSING_CREATE_PARAMS });
          done(new Error(utils.MESSAGE.MISSING_CREATE_PARAMS));
          return;
        }

        const foreignKeys = this.objectWithForeignKeys.find((el) => el.name === object);

        if (foreignKeys) {
          if (!Array.isArray(msg[config.foreignKeys])) {
            msg[config.foreignKeys] = [msg[config.foreignKeys]];
          }

          try {
            const result = await msg['_YOU_shopify'][object].create(...msg[config.foreignKeys], createParams);
            msg.payload = result;
            node.send(msg);
            return;
          } catch (error) {
            node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.ERROR_DURING_CREATE });
            done(error);
            return;
          }
        }

        try {
          const result = await msg['_YOU_shopify'][object].create(createParams);
          msg.payload = result;
          node.send(msg);
          node.status({ fill: 'green', shape: 'dot', text: 'success' });
          return;
        } catch (error) {
          node.status({ fill: 'red', shape: 'dot', text: utils.MESSAGE.ERROR_DURING_CREATE });
          done(error);
          return;
        }
      } catch (error) {
        done(error);
        return;
      }
    });
  }
  RED.nodes.registerType('create', CreateNode);
};
