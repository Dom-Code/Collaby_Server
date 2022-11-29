import { Request, Response, NextFunction } from 'express';
import logging from '../config/logging';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/user';
import signJWT from '../middleware/signJWT';
import generateAccessToken from '../middleware/generateToken';
import Refresh_Token_List from '../models/refresh';

const NAMESPACE = 'User Controller';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated');

    return res.status(200).json({
        message: 'User is authorized'
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { first, last, email, password } = req.body;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            res.status(500).json({
                message: hashError.message,
                error: hashError
            });
        }
        const _user = new User({
            _id: new mongoose.Types.ObjectId(),
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

const login = (req: Request, res: Response, next: NextFunction) => {
    let { email, password } = req.body;
    User.find({ email: email.toLowerCase() })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({ message: 'Unauthorized1' });
            }

            bcryptjs.compare(password, users[0].password, (err, result) => {
                if (result) {
                    signJWT(users[0], (jwtErr, accessToken, refreshToken) => {
                        if (jwtErr) {
                            logging.error(NAMESPACE, 'Unable to sign token', jwtErr);
                            return res.status(401).json({
                                message: 'Unauthorized',
                                error: jwtErr
                            });
                        } else if (accessToken && refreshToken) {
                            const _refresh = new Refresh_Token_List({
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
                } else {
                    return res.status(401).json({ message: 'Unauthorized2' });
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({ message: error.message, error });
        });
};

// returns token and user object

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
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

const token = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Checking if refresh token is valid');

    const { email, refreshToken } = req.body;

    Refresh_Token_List.find({ token: refreshToken }).then(() => {
        res.status(200).json({ accessToken: generateAccessToken({ user: email }) });
    });
};

const deleteRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    Refresh_Token_List.findOneAndDelete({ token: req.body.refreshToken })
        .then((result) => {
            return res.status(200).json({ message: 'User authorization removed' });
        })
        .catch((err) => {
            return res.status(400).json({ err });
        });
};

const home = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: 'Welcome!' });
};
export default { validateToken, register, login, getAllUsers, token, deleteRefreshToken, home };
