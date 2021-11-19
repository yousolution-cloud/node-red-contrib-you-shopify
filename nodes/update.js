module.exports = (RED) => {
  function UpdateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.objectWithForeignKeys = [
      { name: 'article', params: ['blogId'] },
      { name: 'asset', params: ['themeId'] },
      { name: 'customerAddress', params: ['customerId'] },
      { name: 'discountCode', params: ['priceRuleId'] },
      { name: 'fulfillment', params: ['orderId'] },
      { name: 'fulfillmentEvent', params: ['orderId', 'fulfillmentId'] },
      { name: 'orderRisk', params: ['orderId'] },
      { name: 'productImage', params: ['productId'] },
      { name: 'productResourceFeedback', params: ['productId'] },
      { name: 'province', params: ['countryId'] },
    ];

    node.on('input', async (msg) => {
      try {
        let objectId = msg[config.objectId];
        if (!objectId) {
          node.status({ fill: 'red', shape: 'dot', text: 'Update id must have value' });
          return;
        }

        let updateParams = msg[config.updateParams];
        if (!updateParams) {
          node.status({ fill: 'red', shape: 'dot', text: 'Update params must have value' });
          return;
        }
        // let updateParams = {};
        // if (config.updateParams) {
        //   try {
        //     updateParams = eval(config.updateParams);
        //   } catch (error) {
        //     console.log(error);
        //     node.status({ fill: 'red', shape: 'dot', text: 'Update params editor error' });
        //   }
        // }

        const object = config.object;
        const foreignKeys = this.objectWithForeignKeys.find((el) => el.name === object);
        if (foreignKeys) {
          if (!Array.isArray(msg[config.foreignKeys])) {
            msg[config.foreignKeys] = [msg[config.foreignKeys]];
          }

          try {
            const result = await msg['_YOU_shopify'][object].update(...msg[config.foreignKeys], objectId, createParams);
            msg.payload = result;
            node.send([msg, []]);
            return;
          } catch (error) {
            console.log(error);
            node.status({ fill: 'red', shape: 'dot', text: 'Error during update data' });
            this.error(error);
            node.send([[], error]);
            return;
          }
        }

        const result = await msg['_YOU_shopify'][object].update(objectId, updateParams);

        msg.payload = result;
        node.send([msg, []]);
      } catch (error) {
        this.error(error);
        node.send([[], error]);
      }
    });
  }
  RED.nodes.registerType('update', UpdateNode);
};
