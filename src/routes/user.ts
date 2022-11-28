import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/extractJWT';
import { LoginSchema, RegisterSchema, ValidateJoi } from '../middleware/joi';

const router = express.Router();

router.get('/main', controller.main);
router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', ValidateJoi(RegisterSchema), controller.register);
router.post('/login', ValidateJoi(LoginSchema), controller.login);
router.get('/get/all', controller.getAllUsers);
router.post('/token', controller.token);
router.delete('/logout', controller.deleteRefreshToken);

export = router;
