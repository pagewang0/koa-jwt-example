const _ = require('lodash');

const base = require('./default');
const test = require('./test');

const opts = {
  test,
};

const env = process.env.NODE_ENV;

const config = _.merge(base, opts[env]);

module.exports = config;
