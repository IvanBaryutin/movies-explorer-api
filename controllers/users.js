require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken

const User = require('../models/user');
const BadRequestError = require('../errors/400');
const UnauthorizedError = require('../errors/401');
const NotFoundError = require('../errors/404');
const ConflictError = require('../errors/409');

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    // .then((user) => res.send({ data: user }))
    .then((user) => res.send(user))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  // обновим имя найденного по _id пользователя
  // new: true - будет возвращаться новый объект, после обновления (в нашем случае user)
  // runValidators: true - должна проходить валидация, описанная в схеме.
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    // .then((user) => res.send({ data: user }))
    .then((user) => res.send(user))
    .catch((err) => {
      switch (err.name) {
        case 'CastError':
          next(new BadRequestError('Пользователь по указанному _id не найден.'));
          break;
        case 'ValidationError':
          next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
          break;
        default:
          next(err);
      }
    });
};

/*
module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        data: {
          name: user.name,
          email: user.email,
        },
      });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.code === 11000) {
        // throw new ConflictError('Пользователь с таким email уже существует');
        next(new ConflictError('Пользователь с таким email уже существует'));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      next(new NotFoundError('Передан несуществующий _id пользователя.'));
    })
    // .then((user) => res.status(200).send({ data: user }))
    .then((user) => res.status(200).send(user))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    // .then((user) => res.status(200).send({ data: user }))
    .then((user) => res.status(200).send(user))
    // данные не записались, вернём ошибку
    .catch((err) => next(err));
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  // обновим имя найденного по _id пользователя
  // new: true - будет возвращаться новый объект, после обновления (в нашем случае user)
  // runValidators: true - должна проходить валидация, описанная в схеме.
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    // .then((user) => res.send({ data: user }))
    .then((user) => res.send(user))
    .catch((err) => {
      switch (err.name) {
        case 'CastError':
          next(new BadRequestError('Пользователь по указанному _id не найден.'));
          break;
        case 'ValidationError':
          next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
          break;
        default:
          next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  // обновим имя найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    // .then((user) => res.send({ data: user }))
    .then((user) => res.send(user))
    .catch((err) => {
      switch (err.name) {
        case 'CastError':
          next(new BadRequestError('Пользователь по указанному _id не найден.'));
          break;
        case 'ValidationError':
          next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
          break;
        default:
          next(err);
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    // .then((user) => res.send({ data: user }))
    .then((user) => res.send(user))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      // создадим токен
      // const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });

      // вернём токен
      res.send({ token });
    })
    .catch((err) => {
      // ошибка аутентификации
      next(new UnauthorizedError(err.message));
    });
};

*/