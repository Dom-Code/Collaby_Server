import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/extractJWT';
import { LoginSchema, RegisterSchema, ValidateJoi } from '../middleware/joi';

const router = express.Router();

router.get('/home', controller.home);
router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', ValidateJoi(RegisterSchema), controller.register);
router.post('/login', controller.login);
router.get('/get/all', controller.getAllUsers);
router.post('/token', controller.token);
router.delete('/logout', controller.deleteRefreshToken);

export = router;
