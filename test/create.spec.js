const should = require('should');
const helper = require('node-red-node-test-helper');
const create = require('../nodes/create');
const utils = require('../utils');

helper.init(require.resolve('node-red'));

describe('create Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [{ id: 'n1', type: 'create', name: 'create' }];
    helper.load(create, flow, () => {
      const n1 = helper.getNode('n1');
      try {
        n1.should.have.property('name', 'create');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should no have shopify instance', (done) => {
    const flow = [{ id: 'n1', type: 'create', name: 'create', wires: [['n2']] }];
    helper.load(create, flow, () => {
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
      { id: 'n1', type: 'create', name: 'create', wires: [['n2']] },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(create, flow, () => {
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

  it('should no have create params', (done) => {
    const flow = [
      { id: 'n1', type: 'create', name: 'create', wires: [['n2']], object: 'product' },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(create, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      n1.receive({ _YOU_shopify: {} });

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error(utils.MESSAGE.MISSING_CREATE_PARAMS));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should return success ', (done) => {
    const flow = [
      { id: 'n1', type: 'create', name: 'create', wires: [['n2']], object: 'product', createParams: 'createParams' },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(create, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        product: {
          create: async () => {
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

      n1.receive({ _YOU_shopify: shopify, createParams: {} });
    });
  });

  it('should shopify call error ', (done) => {
    const flow = [{ id: 'n1', type: 'create', name: 'create', wires: [['n2']], object: 'product', createParams: 'createParams' }];
    helper.load(create, flow, () => {
      const n1 = helper.getNode('n1');

      const shopify = {
        product: {
          create: async () => {
            return new Promise((resolve, reject) => {
              reject(new Error('Ko'));
            });
          },
        },
      };

      n1.receive({ _YOU_shopify: shopify, createParams: {} });

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error('Ko'));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
