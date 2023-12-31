/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { Joi, errors, celebrate } = require('celebrate');

const { PORT = 3000 } = process.env;
const userRoutes = require('./routes/users');

const app = express();

const cardsRoutes = require('./routes/cards');

const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

const NotFoundError = require('./errors/notFoundErr');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
      about: Joi.string().min(2).max(30).default('Исследователь'),
      avatar: Joi.string()
        .regex(/https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}/)
        .default(
          'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
        ),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(3),
    }),
  }),
  createUser,
);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);
app.use('/users', auth, userRoutes);
app.use('/cards', auth, cardsRoutes);

app.use('*', auth, (req, res, next) => next(new NotFoundError('Введенный ресурс не найден.')));
app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
  next(err);
});
app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
