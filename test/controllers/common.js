exports.register = (rp, payload) => rp.post('/api/v2/auth/register')
  .send(payload)
  .expect(200);

exports.create_post = (rp, payload) => rp.post('/api/v2/posts')
  .set('authsessiontoken', payload.token)
  .send(payload)
  .expect(200);
