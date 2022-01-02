const should = require('should');
const helper = require('node-red-node-test-helper');
const getNode = require('../nodes/get');
const utils = require('../utils');

helper.init(require.resolve('node-red'));

describe('get Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [{ id: 'n1', type: 'get', name: 'get' }];
    helper.load(getNode, flow, () => {
      const n1 = helper.getNode('n1');
      try {
        n1.should.have.property('name', 'get');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should no have shopify instance', (done) => {
    const flow = [{ id: 'n1', type: 'get', name: 'get', wires: [['n2']] }];
    helper.load(getNode, flow, () => {
      const n1 = helper.getNode('n1');

      n1.receive({});

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error(utils.MESSAGE.MISSING_CONNECTION));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should no have type', (done) => {
    const flow = [
      { id: 'n1', type: 'get', name: 'get', wires: [['n2']] },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      n1.receive({ _YOU_shopify: {} });

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error(utils.MESSAGE.MISSING_TYPE));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should no have object id', (done) => {
    const flow = [
      { id: 'n1', type: 'get', name: 'get', wires: [['n2']], object: 'product' },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      n1.receive({ _YOU_shopify: {} });

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error(utils.MESSAGE.MISSING_OBJECT_ID));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should return success', (done) => {
    const flow = [
      { id: 'n1', type: 'get', name: 'get', wires: [['n2']], object: 'product', objectId: 'objectId' },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        product: {
          get: async () => {
            return 'ok';
          },
        },
      };
      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', 'ok');
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, objectId: 1 });
    });
  });

  it('should return error when missing foreign key', (done) => {
    const flow = [{ id: 'n1', type: 'get', name: 'get', wires: [['n2']], object: 'productImage', objectId: 'objectId', foreignKeys: {} }];
    helper.load(getNode, flow, () => {
      const n1 = helper.getNode('n1');

      const shopify = {
        productImage: {
          get: async (productId, id) => {
            return { productId: productId, id: id };
          },
        },
      };

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error(utils.MESSAGE.MISSING_FOREIGN_KEYS));
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, objectId: 2, productId: 1 });
    });
  });

  it('should return success with getParams', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'get',
        name: 'get',
        wires: [['n2']],
        object: 'customer',
        objectId: 'objectId',
        getParams: `params={
        fields: ['id', 'first_name', 'last_name', 'email']};`,
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n2 = helper.getNode('n2');

      const shopify = {
        customer: {
          get: async (id, params) => {
            return { id: id, params: params };
          },
        },
      };

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { id: 1, params: { fields: ['id', 'first_name', 'last_name', 'email'] } });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({
        _YOU_shopify: shopify,
        objectId: 1,
      });
    });
  });

  it('should return success with foreign key', (done) => {
    const flow = [
      { id: 'n1', type: 'get', name: 'get', wires: [['n2']], object: 'productImage', objectId: 'objectId', foreignKeys: 'productId' },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        productImage: {
          get: async (productId, id) => {
            return { productId: productId, id: id };
          },
        },
      };
      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { productId: 1, id: 2 });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, objectId: 2, productId: 1 });
    });
  });

  it('should return success with foreign keys', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'get',
        name: 'get',
        wires: [['n2']],
        object: 'fulfillmentEvent',
        objectId: 'objectId',
        foreignKeys: 'foreignKeys',
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        fulfillmentEvent: {
          get: async (orderId, fulfillmentId, id) => {
            return { orderId: orderId, fulfillmentId: fulfillmentId, id: id };
          },
        },
      };
      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { orderId: 1, fulfillmentId: 2, id: 3 });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, objectId: 3, foreignKeys: [1, 2] });
    });
  });

  it('should shopify return success without id ', (done) => {
    const flow = [
      { id: 'n1', type: 'get', name: 'get', wires: [['n2']], object: 'productListing', foreignKeys: 'foreignKeys' },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(getNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n2 = helper.getNode('n2');

      const shopify = {
        productListing: {
          get: async (foreignKey) => {
            return foreignKey;
          },
        },
      };

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', 1);
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, foreignKeys: [1] });
    });
  });
});
