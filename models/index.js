const mongoose = require('mongoose');

const users = require('./users');
const posts = require('./posts');
const config = require('../config');

mongoose.set('debug', config.mongo.debug);

mongoose.connect(config.mongo.url, config.mongo.opts)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Successfully connect to MongoDB.');
    }
  })
  .catch((err) => {
    console.error('Connection error', err);
  });

module.exports = { users, posts };
