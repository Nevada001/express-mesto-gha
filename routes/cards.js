const cardsRoutes = require('express').Router();
const {getCards, createCard, getCardsByIdAndRemove, likeCard, dislikeCard} = require('../controllers/card');

cardsRoutes.get('/', getCards)
cardsRoutes.delete('/:cardId', getCardsByIdAndRemove)
cardsRoutes.post('/', createCard);
cardsRoutes.put('/:cardId/likes', likeCard)
cardsRoutes.delete('/:cardId/likes', dislikeCard)
module.exports = cardsRoutes