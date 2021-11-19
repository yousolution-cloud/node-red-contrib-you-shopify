module.exports = (RED) => {
  function CreateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

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

    node.on('input', async (msg) => {
      try {
        let createParams = msg[config.createParams];
        if (!createParams) {
          node.status({ fill: 'red', shape: 'dot', text: 'Create params must have value' });
          return;
        }

        const object = config.object;
        const foreignKeys = this.objectWithForeignKeys.find((el) => el.name === object);

        if (foreignKeys) {
          if (!Array.isArray(msg[config.foreignKeys])) {
            msg[config.foreignKeys] = [msg[config.foreignKeys]];
          }

          // let result;
          try {
            const result = await msg['_YOU_shopify'][object].create(...msg[config.foreignKeys], createParams);
          } catch (error) {
            console.log(error);
            node.status({ fill: 'red', shape: 'dot', text: 'Error during create data' });
            this.error(error);
            node.send([[], error]);
            return;
          }

          msg.payload = result;
          node.send([msg, []]);
          return;
        }

        let result;
        try {
          const result = await msg['_YOU_shopify'][object].create(createParams);
          msg.payload = result;
          node.send([msg, []]);
          node.status({ fill: 'green', shape: 'dot', text: 'success' });
          return;
        } catch (error) {
          node.status({ fill: 'red', shape: 'dot', text: 'Error during create data' });
          this.error(error);
          node.send([[], error]);
          return;
        }
      } catch (error) {
        this.error(error);
        node.send([[], error]);
      }
    });
  }
  RED.nodes.registerType('create', CreateNode);
};
