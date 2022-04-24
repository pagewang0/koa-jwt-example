const { assert } = require('chai');
const sinon = require('sinon');
const proxy = require('../../proxy');

describe('proxy users', () => {
  it('get token throw', async () => {
    const ctx = {
      throw: sinon.fake.returns(),
    };

    await proxy.users.get_token(ctx, '', { notBefore: '' });

    assert.isTrue(ctx.throw.called);
    assert.deepEqual(ctx.throw.args, [[400, '签发JWT失败']]);
  });
});
