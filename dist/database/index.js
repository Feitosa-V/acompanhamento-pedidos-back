"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _mongoose = require('mongoose'); var _mongoose2 = _interopRequireDefault(_mongoose);

var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);

class Database {
  constructor() {
    this.init();
  }

  init() {
    _mongoose2.default.connect(
      _database2.default.url,
      _database2.default.config
    )
    .then(() => {
      console.log('Conexão com o MongoDB Atlas estabelecida com sucesso!');
    })
    .catch((err) => {
      console.error('Erro de conexão com o MongoDB Atlas:', err);
    });
  }
}

exports. default = new Database();