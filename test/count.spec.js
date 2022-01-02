const should = require('should');
const helper = require('node-red-node-test-helper');
const count = require('../nodes/count');
// const Shopify = require('shopify-api-node');

helper.init(require.resolve('node-red'));

describe('count Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [{ id: 'n1', type: 'count', name: 'count' }];
    helper.load(count, flow, () => {
      const n1 = helper.getNode('n1');
      try {
        n1.should.have.property('name', 'count');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should no have shopify instance', (done) => {
    const flow = [{ id: 'n1', type: 'count', name: 'count', wires: [['n2']] }];
    helper.load(count, flow, () => {
      const n1 = helper.getNode('n1');

      n1.receive({});

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error('Missing shopify connection'));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should no have type', (done) => {
    const flow = [
      { id: 'n1', type: 'count', name: 'count', wires: [['n2']] },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(count, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      n1.receive({ _YOU_shopify: {} });

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error("missing type. Select it from node's edit panel"));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should return success ', (done) => {
    const flow = [
      { id: 'n1', type: 'count', name: 'count', wires: [['n2']], object: 'product' },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(count, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const shopify = {
        product: {
          count: async () => {
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

      n1.receive({ _YOU_shopify: shopify });
    });
  });

  it('should shopify call error ', (done) => {
    const flow = [{ id: 'n1', type: 'count', name: 'count', wires: [['n2']], object: 'product' }];
    helper.load(count, flow, () => {
      const n1 = helper.getNode('n1');

      const shopify = {
        product: {
          count: async () => {
            return new Promise((resolve, reject) => {
              reject(new Error('Ko'));
            });
          },
        },
      };

      n1.receive({ _YOU_shopify: shopify });

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

  // it('should have credentials', (done) => {
  //   const flow = [
  //     { id: 'n1', type: 'authenticate', name: 'authenticate', wires: [['n2']] },
  //     { id: 'n2', type: 'helper' },
  //   ];
  //   helper.load(authenticate, flow, () => {
  //     const n2 = helper.getNode('n2');
  //     const n1 = helper.getNode('n1');

  //     n1.credentials.password = 'password';
  //     n1.credentials.apiKey = 'apiKey';
  //     n1.receive({});

  //     n2.on('input', (msg) => {
  //       try {
  //         msg.should.have.property('_msgid');
  //         done();
  //       } catch (err) {
  //         done(err);
  //       }
  //     });
  //   });
  // });
});
