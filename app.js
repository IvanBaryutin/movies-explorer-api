const express = require('express');

const mongoose = require('mongoose');

const app = express();
const { PORT = 3000 } = process.env;
const { celebrate, Joi } = require('celebrate');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

//const { createUser, login } = require('./controllers/users');
//const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/404');


app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '61dadc73f388420e667211e6', // _id созданного пользователя
  };
  next();
});

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false
});


app.use(requestLogger); // подключаем логгер запросов

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
  console.log(`App listening on port ${PORT}`)
})