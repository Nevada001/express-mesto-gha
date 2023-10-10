const userRoutes = require('express').Router();
const {getUsers, getUsersById, createUser, updateUser, updateAvatar} = require('../controllers/users');
const User = require('../models/user')
userRoutes.get('/', getUsers);
userRoutes.get('/:id', getUsersById);
userRoutes.post('/', createUser);
userRoutes.patch('/me', updateUser);
userRoutes.patch('/me/avatar', updateAvatar)
module.exports = userRoutes