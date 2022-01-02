const should = require('should');
const helper = require('node-red-node-test-helper');
const updateNode = require('../nodes/update');
const utils = require('../utils');

helper.init(require.resolve('node-red'));

describe('update Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [{ id: 'n1', type: 'update', name: 'update' }];
    helper.load(updateNode, flow, () => {
      const n1 = helper.getNode('n1');
      try {
        n1.should.have.property('name', 'update');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should no have shopify instance', (done) => {
    const flow = [{ id: 'n1', type: 'update', name: 'update', wires: [['n2']] }];
    helper.load(updateNode, flow, () => {
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
      { id: 'n1', type: 'update', name: 'update', wires: [['n2']] },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        productImage: {
          update: async (productId, id) => {
            return { productId: productId, id: id };
          },
        },
      };

      n1.receive({ _YOU_shopify: shopify });

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
      { id: 'n1', type: 'update', name: 'update', wires: [['n2']], object: 'product' },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        product: {
          update: async (productId, id) => {
            return { productId: productId, id: id };
          },
        },
      };
      n1.receive({ _YOU_shopify: shopify });

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

  it('should no have params', (done) => {
    const flow = [
      { id: 'n1', type: 'update', name: 'update', wires: [['n2']], object: 'product', objectId: 'objectId' },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        productImage: {
          update: async (productId, id) => {
            return { productId: productId, id: id };
          },
        },
      };

      n1.receive({ _YOU_shopify: shopify, objectId: 1 });

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error(utils.MESSAGE.MISSING_UPDATE_PARAMS));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should return error when missing foreign key', (done) => {
    const flow = [{ id: 'n1', type: 'update', name: 'update', wires: [['n2']], object: 'productImage', objectId: 'objectId', foreignKeys: {} }];
    helper.load(updateNode, flow, () => {
      const n1 = helper.getNode('n1');

      const shopify = {
        productImage: {
          update: async (productId, id) => {
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

  it('should return success with updateParams', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'update',
        name: 'update',
        wires: [['n2']],
        object: 'customer',
        objectId: 'objectId',
        updateParams: 'updateParams',
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n2 = helper.getNode('n2');

      const shopify = {
        customer: {
          update: async (id, updateParams) => {
            return { id: id, updateParams: updateParams };
          },
        },
      };

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { id: 1, updateParams: { first_name: 'Andrea', last_name: 'Rossi' } });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({
        _YOU_shopify: shopify,
        objectId: 1,
        updateParams: { first_name: 'Andrea', last_name: 'Rossi' },
      });
    });
  });

  it('should return success with foreign key', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'update',
        name: 'update',
        wires: [['n2']],
        object: 'productImage',
        objectId: 'objectId',
        foreignKeys: 'productId',
        updateParams: 'updateParams',
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        productImage: {
          update: async (productId, id, params) => {
            return { productId: productId, id: id, params: params };
          },
        },
      };
      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { productId: 1, id: 2, params: { a: 1 } });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, objectId: 2, productId: 1, updateParams: { a: 1 } });
    });
  });

  it('should return success with foreign keys', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'update',
        name: 'update',
        wires: [['n2']],
        object: 'fulfillmentEvent',
        objectId: 'objectId',
        foreignKeys: 'foreignKeys',
        updateParams: 'updateParams',
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        fulfillmentEvent: {
          update: async (orderId, fulfillmentId, id, params) => {
            return { orderId: orderId, fulfillmentId: fulfillmentId, id: id, params: params };
          },
        },
      };
      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { orderId: 1, fulfillmentId: 2, id: 3, params: { a: 1 } });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, objectId: 3, foreignKeys: [1, 2], updateParams: { a: 1 } });
    });
  });

  it('should shopify return success without id ', (done) => {
    const flow = [
      { id: 'n1', type: 'update', name: 'update', wires: [['n2']], object: 'checkout', foreignKeys: 'foreignKeys', updateParams: 'updateParams' },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(updateNode, flow, () => {
      const n1 = helper.getNode('n1');
      const n2 = helper.getNode('n2');

      const shopify = {
        checkout: {
          update: async (foreignKey, params) => {
            return { foreignKey: foreignKey, params: params };
          },
        },
      };

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('payload', { foreignKey: 1, params: { a: 1 } });
          done();
        } catch (err) {
          done(err);
        }
      });

      n1.receive({ _YOU_shopify: shopify, foreignKeys: [1], updateParams: { a: 1 } });
    });
  });
});
