module.exports = (RED) => {
  function GetNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

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

    node.on('input', async (msg) => {
      try {
        if (config.getParams) {
          try {
            getParams = eval(config.getParams);
          } catch (error) {
            console.log(error);
            node.status({ fill: 'red', shape: 'dot', text: 'Get params editor error' });
          }
        }

        const object = config.object;

        let objectId = msg[config.objectId];

        if (!objectId) {
          node.status({ fill: 'red', shape: 'dot', text: 'Objectid is necessary' });
          return;
        }

        const foreignKeys = this.objectWithForeignKeys.find((el) => el.name === object);

        if (foreignKeys) {
          if (!Array.isArray(msg[config.foreignKeys])) {
            msg[config.foreignKeys] = [msg[config.foreignKeys]];
          }

          const results = await msg['_YOU_shopify'][object].get(...msg[config.foreignKeys], objectId, getParams);

          msg.payload = results;
          node.send([msg, []]);
          return;
        }

        const results = await msg['_YOU_shopify'][object].get(objectId, getParams);
        msg.payload = results;
        node.send([msg, []]);
        return;
      } catch (error) {
        this.error(error);
        node.send([[], error]);
      }
    });
  }
  RED.nodes.registerType('get', GetNode);
};
