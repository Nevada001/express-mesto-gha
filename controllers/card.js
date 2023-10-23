/* eslint-disable consistent-return */
const { ValidationError, CastError } = require('mongoose').Error;
const BadRequestError = require('../errors/badRequest');
const ForbiddenError = require('../errors/forbiddenError');
const NotFoundError = require('../errors/notFoundErr');
const Card = require('../models/card');
const Status = require('../utils/statusCodes');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(Status.OK_REQUEST).send(cards))
    .catch(next);
};

module.exports.getCardsByIdAndRemove = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки');
      }
      return Card.findByIdAndRemove(req.params.cardId);
    })
    .then((deletedCard) => {
      res.status(Status.OK_REQUEST).send(deletedCard);
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        return next(new NotFoundError('ID не найден'));
      }
      if
      (err instanceof CastError) {
        return next(new BadRequestError('Неккоректный ID'));
      }
      return next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((cards) => res.status(Status.CREATED).send(cards))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err instanceof ValidationError) {
        return next(
          new BadRequestError(
            'Указаны некорректные данные при создании карточки',
          ),
        );
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
  .orFail(new Error('NotFound'))
  .then((card) => res.status(Status.OK_REQUEST).send(card))
  .catch((err) => {
    if (err.message === 'NotFound') {
      return next(new NotFoundError('Указан неверный ID'));
    }

    if (err instanceof CastError) {
      return next(new BadRequestError('Некорректный ID'));
    }
    return next(err);
  });

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
  .orFail(new Error('NotFound'))
  .then((card) => res.status(Status.OK_REQUEST).send(card))
  .catch((err) => {
    if (err.message === 'NotFound') {
      return next(new NotFoundError('Указан неверный ID'));
    }
    if (err instanceof CastError) {
      return next(new BadRequestError('Некорректный ID'));
    }
    return next(err);
  });
