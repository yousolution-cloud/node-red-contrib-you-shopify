const Shopify = require('shopify-api-node');

module.exports = function (RED) {
  function AuthenticateConfigNode(n) {
    RED.nodes.createNode(this, n);

    this.options = {
      name: n.name || 'Authenticate',
      shopName: n.shopName,
      accessToken: this.credentials.accessToken,
      apiKey: this.credentials.apiKey,
      password: this.credentials.password,
    };
  }

  RED.nodes.registerType('authenticateConfig', AuthenticateConfigNode, {
    credentials: {
      accessToken: { type: 'password' },
      apiKey: { type: 'password' },
      password: { type: 'password' },
    },
  });

  function AuthenticateNode(n) {
    RED.nodes.createNode(this, n);

    this.authenticateConfig = RED.nodes.getNode(n.authenticateConfig);

    const shopName = this.authenticateConfig.options.shopName;
    const accessToken = this.authenticateConfig.options.accessToken;
    const apiKey = this.authenticateConfig.options.apiKey;
    const password = this.authenticateConfig.options.password;

    try {
      // console.log(await shopify.callLimits());

      if (accessToken) {
        this.shopify = new Shopify({
          shopName,
          accessToken,
        });
      }

      if (apiKey) {
        this.shopify = new Shopify({
          shopName,
          apiKey,
          password,
        });
      }
    } catch (error) {
      console.log(error);
      this.error(error);
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
      if (!accessToken && !apiKey) {
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
