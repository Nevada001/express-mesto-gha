const BadRequestError = require("../errors/badRequest");
const NotFoundError = require("../errors/notFoundErr");
const Card = require("../models/card");
const Status = require("../utils/statusCodes");
const { ValidationError, CastError } =
  require("mongoose").Error;
module.exports.getCards = (req, res, next ) => {
  Card.find({})
    .then((cards) => res.status(Status.OK_REQUEST).send(cards))
    .catch((err) =>
    next(new BadRequestError('Произошла ошибка'))
    )
    next(err)
};

module.exports.getCardsByIdAndRemove = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId).orFail(new Error('NotFound'))
    .then((cards) => res.status(Status.OK_REQUEST).send(cards))
    .catch((err) => {
      if (err.message === "NotFound") {
        next(new NotFoundError("ID не найден"));
      }
      if (err instanceof CastError) {
       next(new BadRequestError("Неккоректный ID"));
      }
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((cards) => res.status(Status.CREATED).send(cards))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError("Указаны некорректные данные при создании карточки"))
        };
      next(err)
});
}

module.exports.likeCard = (req, res) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  ).orFail(new Error('NotFound'))
    .then((card) => res.status(Status.OK_REQUEST).send(card))
    .catch((err) => {
      if (err.message === "NotFound") {
        next(new NotFoundError("Указан неверный ID"))};

      if (err instanceof CastError) {
        next(new BadRequestError("Некорректный ID")) };
      next(err)
    });

module.exports.dislikeCard = (req, res) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  ).orFail(new Error('NotFound'))
    .then((card) => res.status(Status.OK_REQUEST).send(card))
    .catch((err) => {
      if (err.message === "NotFound") {
        next(new NotFoundError("Указан неверный ID"));
      }
      if (err instanceof CastError) {
        next(new BadRequestError("Некорректный ID" ));
      }

      return res.status(Status.SERVER_ERROR);
    })
