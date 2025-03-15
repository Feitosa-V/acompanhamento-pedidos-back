"use strict";Object.defineProperty(exports, "__esModule", {value: true}); 
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _auth = require('../../config/auth'); var _auth2 = _interopRequireDefault(_auth);

exports. default = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: true, message: 'Token not informed' });
  }

  //Pegando apenas o token do array
  const [, token] = authHeader.split(' ');

  try {
    _jsonwebtoken2.default.verify(token, _auth2.default.secret, async (error, response) => {
      if (!error && response) {
        req.user = { id: response.id };
        return next();
      } else {
        return res.status(401).json({ error: true, message: 'Invalid token' });
      }
    });
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Invalid Token' });
  }
}