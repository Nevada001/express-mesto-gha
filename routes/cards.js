const cardsRoutes = require('express').Router();
const {getCards, createCard, getCardsByIdAndRemove, likeCard} = require('../controllers/card');
const Card = require('../models/card')
cardsRoutes.get('/', getCards)
cardsRoutes.delete('/:cardId', getCardsByIdAndRemove)
cardsRoutes.post('/', createCard);
cardsRoutes.put('/:cardId/likes', likeCard)
module.exports = cardsRoutes