const Movie = require('../models/movie');

const BadRequestError = require('../errors/400');
const ForbiddenError = require('../errors/403');
const NotFoundError = require('../errors/404');


module.exports.getMovies = (req, res, next) => {
  Card.find({})
    .then((movie) => res.status(200).send(movie))
    // данные не записались, вернём ошибку
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const { country, director, duration, year, description, image, trailer, thumbnail, movieId, nameRU, nameEN } = req.body;
  const owner = req.user._id;

  Movie.create({ country, director, duration, year, description, image, trailer, thumbnail, owner, movieId, nameRU, nameEN })
    // вернём записанные в базу данные
    .then((movie) => res.status(200).send(movie))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie) {
        if (movie.owner.toString() === req.user._id) {
          Movie.deleteOne({ _id: req.params.movieId })
            .then(res.status(200).send({ message: 'Карточка удалена' }));
        } else {
          next(new ForbiddenError('Запрещено удалять чужие карточки.'));
        }
      } else {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Карточка с указанным _id не найдена.'));
      } else {
        next(err);
      }
    });
};
