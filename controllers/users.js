const Users = require("../models/user");
const Status = require("../utils/statusCodes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/badRequest");
const MongoDuplicateError = require("../errors/mongoDuplicateError");
const UnAuthorizedError = require("../errors/unAuthorized");
const saltRounds = 10;
const { ValidationError, CastError } = require("mongoose").Error;

module.exports.getUsers = (req, res, next) => {
  Users.find({})
    .then((users) => {
      if (!users) {
        throw new BadRequestError("Произошла ошибка");
      }
      res.send(users);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res) => {
  Users.findById(req.user._id)
    .orFail(new NotFoundError("Пользователь не найден"))
    .then((user) => {
      res.status(Status.OK_REQUEST).send(user);
    })
    .catch((err) => {
      if (err instanceof CastError) {
        throw new BadRequestError("Указан невалидный ID");
      }
      return next(err);
    });
};
module.exports.getUsersById = (req, res) => {
  Users.findById(req.params.id)
    .orFail(new NotFoundError("Пользователь не найден"))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err instanceof CastError) {
        throw new BadRequestError("Указан невалидный ID");
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt.hash(password, saltRounds).then((hash) => {
    Users.create({ password: hash, name, about, avatar, email })
      .then((users) =>
        res.status(Status.CREATED).send({
          name: users.name,
          about: users.about,
          avatar: users.avatar,
          email: users.email,
        })
      )
      .catch((err) => {
        if (err.code === Status.MONGO_DUPLICATE) {
          next(
            new MongoDuplicateError(
              "Пользователь с таким email уже зарегитстрирован"
            )
          );
        }
        if (err instanceof ValidationError) {
          next(new BadRequestError("Ошибка валидации полей"));
        }
        next(err);
      });
  });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  Users.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true }
  )
    .orFail(new NotFoundError("Пользователь не найден"))
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError("Неверно введены данные"));
      }
      next(err);
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true }
  )
    .orFail(new NotFoundError("Пользователь не найден"))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError("Неверно введены данные"));
      }
      next(err);
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return Users.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, "super-secret", { expiresIn: "7d" }),
      });
    })
    .catch((err) => {
      if (err.code === Status.UNAUTHORIZED) {
        next(new UnAuthorizedError("Неправильные почта или пароль"));
      }
      next(err)
    });
};
