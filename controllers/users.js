/* eslint-disable arrow-body-style */
/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
const { ValidationError, CastError } = require('mongoose').Error;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../models/user');
const Status = require('../utils/statusCodes');
const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFoundErr');
const MongoDuplicateError = require('../errors/mongoDuplicateError');
const UnAuthorizedError = require('../errors/unAuthorized');

const saltRounds = 10;

module.exports.getUsers = (req, res, next) => {
  Users.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  Users.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(Status.OK_REQUEST).send(user);
    })
    .catch((err) => {
      if (err instanceof CastError) {
        return next(new BadRequestError('Указан невалидный ID'));
      }
      return next(err);
    });
};
module.exports.getUsersById = (req, res, next) => {
  Users.findById(req.params.id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err instanceof CastError) {
        return next(new BadRequestError('Указан невалидный ID'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, saltRounds).then((hash) => {
    Users.create({
      password: hash,
      name,
      about,
      avatar,
      email,
    })
      .then((users) => res.status(Status.CREATED).send({
        name: users.name,
        about: users.about,
        avatar: users.avatar,
        email: users.email,
      }))
      .catch((err) => {
        if (err instanceof ValidationError) {
          return next(new BadRequestError('Ошибка валидации полей'));
        }
        if (err.code === Status.MONGO_DUPLICATE) {
          return next(
            new MongoDuplicateError(
              'Пользователь с таким email уже зарегистрирован',
            ),
          );
        } else {
          next(err);
        }
      })
      .catch((err) => {
        return next(err);
      });
  });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  Users.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return next(new BadRequestError('Ошибка валидации полей'));
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return next(new BadRequestError('Ошибка валидации полей'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return Users.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, 'super-secret', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      if (err.message === 'NotAutanticate') {
        return next(new UnAuthorizedError('Неправильные почта или пароль'));
      }
      return next(err);
    });
};
