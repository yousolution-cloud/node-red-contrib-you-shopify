module.exports = (RED) => {
  function ListNode(config) {
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
      { name: 'fulfillment', params: ['orderId'] },
      { name: 'giftCardAdjustment', params: ['giftCardId'] },
      { name: 'orderRisk', params: ['orderId'] },
      { name: 'productImage', params: ['productId'] },
      { name: 'productResourceFeedback', params: ['productId'] },
      { name: 'productVariant', params: ['productId'] },
      { name: 'province', params: ['countryId'] },
      { name: 'refund', params: ['orderId'] },
      { name: 'transaction', params: ['orderId'] },
      { name: 'usageCharge', params: ['recurringApplicationChargeId'] },
    ];

    node.on('input', async (msg) => {
      try {
        let listParams = {};
        if (config.listParams) {
          try {
            listParams = eval(config.listParams);
          } catch (error) {
            console.log(error);
            node.status({ fill: 'red', shape: 'dot', text: 'List params editor error' });
          }
        }

        const object = config.object;

        // let objectId = msg[config.objectId];
        // if (objectId) {
        //   const results = await msg['_YOU_shopify'][object].get(objectId, listParams);
        //   msg.payload = results;
        //   node.send([msg, []]);
        //   return;
        // }

        if (this.objectWithoutParams.includes(object)) {
          const results = await msg['_YOU_shopify'][object].list();

          msg.payload = results;
          node.send([msg, []]);
          return;
        }

        const foreignKeys = this.objectWithForeignKeys.find((el) => el.name === object);

        if (foreignKeys) {
          const results = await msg['_YOU_shopify'][object].list(msg[config.foreignKeys], listParams);

          msg.payload = results;
          node.send([msg, []]);
          return;
        }

        const results = await msg['_YOU_shopify'][object].list(listParams);

        msg.payload = results;
        node.send([msg, []]);
      } catch (error) {
        this.error(error);
        node.send([[], error]);
      }
    });
  }
  RED.nodes.registerType('list', ListNode);
};
