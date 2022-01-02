const Shopify = require('shopify-api-node');

module.exports = function (RED) {
  function AuthenticateNode(config) {
    RED.nodes.createNode(this, config);

    // const flowContext = this.context().flow;
    // const nodeContext = this.context();

    // let shopify;
    try {
      this.shopify = new Shopify({
        shopName: config.shopName,
        apiKey: this.credentials.apiKey,
        password: this.credentials.password,
      });

      // console.log(await shopify.callLimits());
    } catch (error) {
      // this.error(error);
      this.status({ fill: 'gray', shape: 'ring', text: 'Set credentials' });
    }
    if (this.shopify) {
      this.shopify.on('callLimits', (limits) => {
        node.status({ fill: 'green', shape: 'dot', text: JSON.stringify(limits) });
        console.log(limits);
      });
    }

    const node = this;

    node.on('input', async (msg, send, done) => {
      // reset status
      node.status({});
      if (this.shopify) {
        // try {
        //   const user = await this.shopify.user.current();
        //   console.log(user);
        // } catch (error) {
        //   done(error);
        //   node.status({ fill: 'red', shape: 'dot', text: 'Wrong credentials' });
        //   return;
        // }
      }
      // try {
      if (!node.credentials.apiKey || !node.credentials.password) {
        node.status({ fill: 'red', shape: 'dot', text: 'Missing credentials' });
        done(new Error('Missing credentials'));
        return;
      }

      // shopify.on('callLimits', (limits) => console.log(limits));
      // const list = await shopify.accessScope.list();
      // node.status({ fill: 'green', shape: 'dot', text: 'connected' });
      // }
      // catch (error) {
      //   node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
      // }
      // msg.shopify = nodeContext.get('shopify');
      msg['_YOU_shopify'] = this.shopify;
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
