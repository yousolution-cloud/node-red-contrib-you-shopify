const should = require('should');
const helper = require('node-red-node-test-helper');
const authenticate = require('../nodes/authenticate');
const { nodes } = require('node-red');
const Shopify = require('shopify-api-node');

helper.init(require.resolve('node-red'));

describe('authenticate Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [{ id: 'n1', type: 'authenticate', name: 'authenticate' }];
    helper.load(authenticate, flow, () => {
      const n1 = helper.getNode('n1');
      try {
        n1.should.have.property('name', 'authenticate');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should no have credentials', (done) => {
    const flow = [
      { id: 'n1', type: 'authenticate', name: 'authenticate', wires: [['n2']] },
      // { id: 'n2', type: 'helper' },
    ];
    helper.load(authenticate, flow, () => {
      // const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      n1.receive({});

      n1.on('call:error', (error) => {
        try {
          error.should.have.property('firstArg', new Error('Missing credentials'));
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should have credentials', (done) => {
    const flow = [
      { id: 'n1', type: 'authenticate', name: 'authenticate', wires: [['n2']] },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(authenticate, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      n1.credentials.password = 'password';
      n1.credentials.apiKey = 'apiKey';
      n1.receive({});

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('_msgid');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should have shopify instance', (done) => {
    const flow = [
      { id: 'n1', type: 'authenticate', name: 'authenticate', wires: [['n2']] },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(authenticate, flow, () => {
      const n2 = helper.getNode('n2');
      let n1 = helper.getNode('n1');
      shopify = new Shopify({
        shopName: 'yousolutionTest',
        apiKey: 'apiKey',
        password: 'password',
      });
      n1.shopify = shopify;

      n1.credentials.password = 'password';
      n1.credentials.apiKey = 'apiKey';
      n1.receive({});

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('_msgid');
          msg.should.have.property('_YOU_shopify');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
