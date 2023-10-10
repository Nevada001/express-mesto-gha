const Card = require("../models/card");
const Status = require("../utils/statusCodes");
const { ValidationError, CastError } =
  require("mongoose").Error;
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(Status.OK_REQUEST).send(cards))
    .catch(() =>
      res.status(Status.BAD_REQUEST).send({ message: "Произошла ошибка" })
    );
};

module.exports.getCardsByIdAndRemove = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId).orFail(new Error('NotFound'))
    .then((cards) => res.status(Status.OK_REQUEST).send(cards))
    .catch((err) => {
      if (err.message === "NotFound") {
        return res
          .status(Status.NOT_FOUND)
          .send({ message: "ID не найден" });
      }
      if (err instanceof CastError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Неккоректный ID" });
      }
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((cards) => res.status(Status.CREATED).send(cards))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res.status(Status.BAD_REQUEST).send({
          message: "Указаны некорректные данные при создании карточки",
        });
      }
      return res
        .status(Status.SERVER_ERROR)
        .send({ message: "Ошибка на стороне сервера" });
    });
};

module.exports.likeCard = (req, res) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  ).orFail(new Error('NotFound'))
    .then((card) => res.status(Status.OK_REQUEST).send(card))
    .catch((err) => {
      if (err.message === "NotFound") {
        return res
          .status(Status.NOT_FOUND)
          .send({ message: "Указан неверный ID" });
      }
      if (err instanceof CastError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Некорректный ID" });
      }

      return res.status(Status.SERVER_ERROR);
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
        return res
          .status(Status.NOT_FOUND)
          .send({ message: "Указан неверный ID" });
      }
      if (err instanceof CastError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Некорректный ID" });
      }

      return res.status(Status.SERVER_ERROR);
    });
