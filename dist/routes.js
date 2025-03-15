"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }//Importo somente a funcão router
var _express = require('express');

var _DashboardsController = require('./app/controllers/DashboardsController'); var _DashboardsController2 = _interopRequireDefault(_DashboardsController);
var _SessionsController = require('./app/controllers/SessionsController'); var _SessionsController2 = _interopRequireDefault(_SessionsController);

var _auth = require('./app/middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);

const routes = new (0, _express.Router)();

//################## PROOF #####################
//Session
routes.post('/proof/session', _SessionsController2.default.store);
//################## PROOF #####################

//################## MIDDLEWARE AUTH #####################
routes.use(_auth2.default);
//################## MIDDLEWARE AUTH #####################

//################## AUTH PROOF #####################
routes.get('/proof/dashboard', _DashboardsController2.default.store);

//################## AUTH PROOF #####################

exports. default = routes;
