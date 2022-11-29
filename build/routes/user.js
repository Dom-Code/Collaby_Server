"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../controllers/user"));
const extractJWT_1 = __importDefault(require("../middleware/extractJWT"));
const joi_1 = require("../middleware/joi");
const router = express_1.default.Router();
router.get('/home', user_1.default.home);
router.get('/validate', extractJWT_1.default, user_1.default.validateToken);
router.post('/register', (0, joi_1.ValidateJoi)(joi_1.RegisterSchema), user_1.default.register);
router.post('/login', user_1.default.login);
router.get('/get/all', user_1.default.getAllUsers);
router.post('/token', user_1.default.token);
router.delete('/logout', user_1.default.deleteRefreshToken);
module.exports = router;
