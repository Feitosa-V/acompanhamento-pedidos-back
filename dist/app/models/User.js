"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _mongoose = require('mongoose'); var _mongoose2 = _interopRequireDefault(_mongoose);
var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);
var _meteorsha = require('@pozible/meteor-sha'); var _meteorsha2 = _interopRequireDefault(_meteorsha);

const UsersSchema = new _mongoose2.default.Schema(
    {
        _id: {
            type: String,
            required: true
        },
        profile: {
            type: Object,
            type: { type: String },
            name: { type: String, required: true },
            secondary_name: { type: String },
            cpf_cnpj: { type: String },
            phone: { type: String },
            status: { type: String },
            roles: {
                type: Array,
                role: { type: String }
            },
            active: {
                type: Boolean
            }
        },
        emails: {
            type: Array,
            required: true,
            address: {
                type: String,
                required: true,
                lowercase: true
            },
            verified: {
                type: Boolean,
                required: true
            }
        },
        services: {
            type: Object,
            required: true,
            password: {
                type: Object,
                required: true,
                bcrypt: {
                    type: String,
                    required: true,
                    select: false
                }
            }
        },
        history: {
            type: Array,
            type: { type: String },
            date: { type: Date }
        },
        removed: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
);

//Arrow functions não tem acesso ao metodo this
UsersSchema.pre('save', async function (next) {
    //convert  text password to SHA256 to work in Meteor
    const newPassword = _meteorsha2.default.call(void 0, this.services.password.bcrypt);
    const hash = await _bcryptjs2.default.hash(newPassword, 10);

    this.services.password.bcrypt = hash;

    next();
});

exports. default = _mongoose2.default.model('User', UsersSchema);
