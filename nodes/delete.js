module.exports = (RED) => {
  function DeleteNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg) => {
      try {
        let objectId = msg[config.objectId];
        if (!objectId) {
          node.status({ fill: 'red', shape: 'dot', text: 'Delete id must have value' });
          return;
        }
        const object = config.object;
        const result = await msg['_YOU_shopify'][object].delete(objectId);

        msg.payload = result;
        node.send([msg, []]);
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
      } catch (error) {
        this.error(error);
        node.send([[], error]);
      }
    });
  }
  RED.nodes.registerType('delete', DeleteNode);
};
