"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../config/logging"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const signJWT_1 = __importDefault(require("../middleware/signJWT"));
const generateToken_1 = __importDefault(require("../middleware/generateToken"));
const refresh_1 = __importDefault(require("../models/refresh"));
const NAMESPACE = 'User Controller';
const validateToken = (req, res, next) => {
    logging_1.default.info(NAMESPACE, 'Token validated');
    return res.status(200).json({
        message: 'User is authorized'
    });
};
const register = (req, res, next) => {
    let { first, last, email, password } = req.body;
    bcryptjs_1.default.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            res.status(500).json({
                message: hashError.message,
                error: hashError
            });
        }
        const _user = new user_1.default({
            _id: new mongoose_1.default.Types.ObjectId(),
            first: first,
            last: last,
            email: email.toLowerCase(),
            password: hash,
            editor: '',
            code: '',
            team: []
        });
        return _user
            .save()
            .then((user) => {
            return res.status(201).json({ user });
        })
            .catch((err) => {
            return res.status(500).json({
                message: err.message,
                err
            });
        });
    });
};
const login = (req, res, next) => {
    let { email, password } = req.body;
    user_1.default.find({ email: email.toLowerCase() })
        .exec()
        .then((users) => {
        if (users.length !== 1) {
            return res.status(401).json({ message: 'Unauthorized1' });
        }
        bcryptjs_1.default.compare(password, users[0].password, (err, result) => {
            if (result) {
                (0, signJWT_1.default)(users[0], (jwtErr, accessToken, refreshToken) => {
                    if (jwtErr) {
                        logging_1.default.error(NAMESPACE, 'Unable to sign token', jwtErr);
                        return res.status(401).json({
                            message: 'Unauthorized',
                            error: jwtErr
                        });
                    }
                    else if (accessToken && refreshToken) {
                        const _refresh = new refresh_1.default({
                            token: refreshToken
                        });
                        return _refresh
                            .save()
                            .then((user) => {
                            return res.status(200).json({
                                message: 'Auth Successful',
                                accessToken,
                                refreshToken
                                // user: users[0]
                            });
                        })
                            .catch((err) => {
                            return res.status(500).json({
                                message: err.message,
                                err
                            });
                        });
                    }
                });
            }
            else {
                return res.status(401).json({ message: 'Unauthorized2' });
            }
        });
    })
        .catch((error) => {
        return res.status(500).json({ message: error.message, error });
    });
};
// returns token and user object
const getAllUsers = (req, res, next) => {
    user_1.default.find()
        .select('-password')
        .exec()
        .then((users) => {
        return res.status(200).json({
            users,
            count: users.length
        });
    })
        .catch((error) => {
        return res.status(500).json({ message: error.message, error });
    });
};
// returns each user in DB (NO PW)
const token = (req, res, next) => {
    logging_1.default.info(NAMESPACE, 'Checking if refresh token is valid');
    const { email, refreshToken } = req.body;
    refresh_1.default.find({ token: refreshToken }).then(() => {
        res.status(200).json({ accessToken: (0, generateToken_1.default)({ user: email }) });
    });
};
const deleteRefreshToken = (req, res, next) => {
    refresh_1.default.findOneAndDelete({ token: req.body.refreshToken })
        .then((result) => {
        return res.status(200).json({ message: 'User authorization removed' });
    })
        .catch((err) => {
        return res.status(400).json({ err });
    });
};
const home = (req, res, next) => {
    return res.status(200).json({ message: 'Welcome!' });
};
exports.default = { validateToken, register, login, getAllUsers, token, deleteRefreshToken, home };
