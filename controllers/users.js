const Users = require("../models/user");
const Status = require("../utils/statusCodes");
const { ValidationError, CastError } = require("mongoose").Error;

module.exports.getUsers = (req, res) => {
  Users.find({})
    .then((users) => res.send(users))
    .catch(() =>
      res.status(Status.BAD_REQUEST).send({ message: "Произошла ошибка" })
    );
};

module.exports.getUsersById = (req, res) => {
  const { id } = req.params;
  Users.findById(req.params.id)
    .orFail(new Error("NotFound"))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.message === "NotFound") {
        return res
          .status(Status.NOT_FOUND)
          .send({ message: "Пользователь не найден" });
      }
      if (err instanceof CastError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Указан не валидный ID" });
      }
      res.status(500).send({ message: "Произошла ошибка" });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  Users.create({ name, about, avatar })
    .then((users) => res.status(Status.CREATED).send(users))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Ошибка валидации полей" });
      }
      res.status(500).send({ message: "Произошла ошибка" });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  Users.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true }
  )
    .orFail(new Error("NotFound"))
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.message === "NotFound") {
        return res
          .status(Status.NOT_FOUND)
          .send({ message: "Пользователь не найден" });
      }
      if (err instanceof ValidationError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Неверно введены данные" });
      }
      res.status(Status.SERVER_ERROR).send({ message: "Произошла ошибка" });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true }
  )
    .orFail(new Error("NotFound"))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.message === "NotFound") {
        return res
          .status(Status.NOT_FOUND)
          .send({ message: "Пользователь не найден" });
      }
      if (err instanceof ValidationError) {
        return res
          .status(Status.BAD_REQUEST)
          .send({ message: "Неверно введены данные" });
      }
      res.status(Status.SERVER_ERROR).send({ message: "Произошла ошибка" });
    });
};
