const express = require('express');
const Status = require('./utils/statusCodes')
const bodyParser = require('body-parser')
const { PORT = 3000} = process.env;
const userRoutes = require('./routes/users')
const app = express();
const mongoose = require('mongoose');
const cardsRoutes = require('./routes/cards');
const helmet = require('helmet')

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');
app.use((req, res, next) => {
  req.user = {
    _id: '6523e9f7e56c3a302f836fbc'
  };
  next();
});
app.use(helmet())
app.use(bodyParser.json())
app.use('/users', userRoutes)
app.use('/cards', cardsRoutes)
app.use('*', (req, res) => res.status(Status.NOT_FOUND).send({ message: 'Введенный ресурс не найден' }));

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`)
});