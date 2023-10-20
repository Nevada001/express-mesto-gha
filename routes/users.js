const userRoutes = require('express').Router();
const {getUsers, getUsersById, updateUser, updateAvatar, getCurrentUser} = require('../controllers/users');
userRoutes.get('/', getUsers);
userRoutes.get('/me', getCurrentUser);
userRoutes.get('/:id', getUsersById);
userRoutes.patch('/me', updateUser);
userRoutes.patch('/me/avatar', updateAvatar);
module.exports = userRoutes