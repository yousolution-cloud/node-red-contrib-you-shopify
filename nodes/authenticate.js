const Shopify = require('shopify-api-node');

module.exports = function (RED) {
  function AuthenticateNode(config) {
    RED.nodes.createNode(this, config);

    // const flowContext = this.context().flow;
    // const nodeContext = this.context();

    let shopify;
    try {
      shopify = new Shopify({
        shopName: config.shopName,
        apiKey: this.credentials.apiKey,
        password: this.credentials.password,
      });
    } catch (error) {
      // this.error(error);
      this.status({ fill: 'gray', shape: 'ring', text: 'Set credentials' });
    }

    const node = this;

    node.on('input', async (msg) => {
      try {
        if (!node.credentials.apiKey || !node.credentials.password) {
          node.status({ fill: 'red', shape: 'dot', text: 'Missing credentials' });
          return;
        }
        // const list = await shopify.accessScope.list();
        node.status({ fill: 'green', shape: 'dot', text: 'connected' });
      } catch (error) {
        node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
      }
      // msg.shopify = nodeContext.get('shopify');
      msg['_YOU_shopify'] = shopify;
      node.send(msg);
    });
  }
  RED.nodes.registerType('authenticate', AuthenticateNode, {
    credentials: {
      apiKey: { type: 'password' },
      password: { type: 'password' },
    },
  });
};
