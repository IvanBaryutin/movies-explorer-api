const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const auth = require('../middlewares/auth');

const NotFoundError = require('../errors/404');

const {
  createUser,
  login,
} = require('../controllers/users');

const userCredentialsValidator = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
  }),
});

// роуты, не требующие авторизации,
router.post('/signup', userCredentialsValidator, createUser);
router.post('/signin', userCredentialsValidator, login);

// авторизация
router.use(auth);

router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

module.exports = router;
