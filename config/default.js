module.exports = {
  jwt: {
    secret: 'local-secret',
    unless: [
      '/api/v2/auth/register',
      '/api/v2/auth/login',
    ],
  },
  mongo: {
    url: 'mongodb://127.0.0.1:27017/blog',
    opts: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    debug: false,
  },
};
