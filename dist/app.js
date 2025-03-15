"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);
var _routes = require('./routes'); var _routes2 = _interopRequireDefault(_routes);

require('./database');

class App {
  constructor() {
    this.server = _express2.default.call(void 0, );

    this.middlewares();
    this.routes();
  }

  
  middlewares() {
    //tamanho configurado no express e no nginx
    this.server.use(_express2.default.json({limit: '100mb'}));
  }

  routes() {
    this.server.use(_cors2.default.call(void 0, ));
    this.server.use(_routes2.default);
  }
}

exports. default = new App().server;
