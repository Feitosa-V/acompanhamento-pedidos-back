"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);
var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _meteorsha = require('@pozible/meteor-sha'); var _meteorsha2 = _interopRequireDefault(_meteorsha);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _auth = require('../../config/auth'); var _auth2 = _interopRequireDefault(_auth);

class SessionsController {
  async store(req, res) {
    try {
      const {
        email,
        password
      } = req.body;

      const user = await _User2.default.findOne({
        "emails.address": email.toLowerCase()
      }).select('+services.password.bcrypt');

      if (!user) {
        return res.status(401).json({
          error: true,
          message: 'Usuário não encontrado. Verifique se o e-mail digitado está correto e tente novamente.'
        });
      }

      const newPassword = _meteorsha2.default.call(void 0, password);

      // return res.status(200).json({
      //   nespass :newPassword,
      //   user: user
      // });

      

      //Valida se a senha está correta
      if (!(await _bcryptjs2.default.compare(newPassword, user.services.password))) {
        return res.status(401).json({
          error: true,
          message: 'A senha digitada está incorreta. Tente novamente ou recupere a sua senha.'
        });
      }

      //Gera token
      const token = _jsonwebtoken2.default.sign({
        id: user._id
      }, _auth2.default.secret, {
        expiresIn: _auth2.default.expiresIn
      })

      //Remove campos desnecessários
      user.services = undefined;
      user.createdAt = undefined;
      user.updatedAt = undefined;

      return res.status(200).json({
        profile: { name: user.profile.name ? user.profile.name : 'Nome do Cliente' },
        email: user.emails[0].address,
        token: token,
        id: user._id
      });

    } catch (error) {

      console.error(error);  // Adicionei este log para mostrar o erro no console do servidor
      return res.status(500).json({
        error: true,
        message: 'Ops! Ocorreu um erro em nosso servidor. Por favor, tente novamente ou contate o suporte.' + error
      });
    }
  }
}

exports. default = new SessionsController();