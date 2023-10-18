const userRoutes = require('express').Router();
const {getUsers, getUsersById, updateUser, updateAvatar, getCurrentUser} = require('../controllers/users');
const auth = require('../middlewares/auth');
userRoutes.get('/', getUsers);
userRoutes.get('/:id', getUsersById);
userRoutes.get('/me', getCurrentUser)
userRoutes.patch('/me', updateUser);
userRoutes.patch('/me/avatar', updateAvatar)
module.exports = userRoutes