const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Promise = require('bluebird');

exports.jwt_sign = Promise.promisify(jwt.sign);
exports.jwt_verify = Promise.promisify(jwt.verify);

exports.md5 = (str, salt) => crypto.createHash('md5').update(`${salt}${str}`).digest('hex');
