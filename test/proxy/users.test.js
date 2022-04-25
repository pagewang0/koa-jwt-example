const { assert } = require('chai');
const proxy = require('../../proxy');

describe('proxy users', () => {
  it('get token throw', async () => {
    const err = await proxy.users.get_token('', { notBefore: '' })
      .catch((err) => err);

    assert.equal(err.output.payload.message, '签发JWT失败');
    assert.equal(err.output.statusCode, 400);
  });
});
