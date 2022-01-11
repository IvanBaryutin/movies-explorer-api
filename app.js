const express = require('express');

const mongoose = require('mongoose');

const app = express();
const { PORT = 3000 } = process.env;
const { DB_URL = 'mongodb://localhost:27017/moviesdb' } = process.env;
const { celebrate, Joi } = require('celebrate');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/404');

// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  'https://the-diploma.nomoredomains.rocks',
  'http://the-diploma.nomoredomains.rocks',
  'localhost:3000',
];

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '61dd4813c8f41c58e1d85cf3', // _id созданного пользователя
  };
  next();
});

app.use((req, res, next) => {
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin
  // сохраняем список заголовков исходного запроса
  const requestHeaders = req.headers['access-control-request-headers'];

  // проверяем, что источник запроса есть среди разрешённых
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header('Access-Control-Allow-Origin', origin);
  }

  const { method } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную

  // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  // Если это предварительный запрос, добавляем нужные заголовки
  if (method === 'OPTIONS') {
    // разрешаем кросс-доменные запросы любых типов (по умолчанию)
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    // разрешаем кросс-доменные запросы с этими заголовками
    res.header('Access-Control-Allow-Headers', requestHeaders);
    // завершаем обработку запроса и возвращаем результат клиенту
    return res.end();
  }

  next();
});

// подключаемся к серверу mongo
mongoose.connect(DB_URL, {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false
});

const userCredentialsValidator = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
  }),
});

app.use(requestLogger); // подключаем логгер запросов

// роуты, не требующие авторизации,
app.post('/signup', userCredentialsValidator, createUser);
app.post('/signin', userCredentialsValidator, login);

// авторизация
app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

app.use(error);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // console.log(`App listening on port ${PORT}`)
});
