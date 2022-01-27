module.exports = (err, req, res, next) => {
  // console.log(err);
  if (err.statusCode === 500 || !err.statusCode) {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  } else {
    res.status(err.statusCode).send({ message: err.message });
  }
  next(); // пропускаем запрос дальше
};
