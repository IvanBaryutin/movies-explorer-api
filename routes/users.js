const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getCurrentUser, updateUserInfo,
} = require('../controllers/users');

const userIdValidator = celebrate({
  body: Joi.object().keys({
    userId: Joi.string().length(24).hex(),
  }),
});

const userInfoValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
});

router.get('/me', userIdValidator, getCurrentUser);
router.patch('/me', userInfoValidator, updateUserInfo);

module.exports = router;
