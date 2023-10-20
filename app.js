const express = require('express');
const Status = require('./utils/statusCodes')
const bodyParser = require('body-parser')
const { PORT = 3000} = process.env;
const userRoutes = require('./routes/users')
const app = express();
const mongoose = require('mongoose');
const cardsRoutes = require('./routes/cards');
const helmet = require('helmet');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth')

const { Joi, errors,  celebrate } = require('celebrate')


mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(helmet())
app.use(bodyParser.json())
app.post('/signup',   celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default("Жак-Ив Кусто"),
    about: Joi.string().min(2).max(30).default("Исследователь"),
    avatar: Joi.string().uri().default(
      "https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png"
    ),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(3),
  }),
}),createUser)
app.post('/signin', login)
app.use('/users', auth, userRoutes)
app.use('/cards', auth,  cardsRoutes)
app.use('*', (req, res) => res.status(Status.NOT_FOUND).send({ message: 'Введенный ресурс не найден' }));
app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message
    });
})
app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`)
});