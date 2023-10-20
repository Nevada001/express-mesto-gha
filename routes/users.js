const userRoutes = require("express").Router();
const { Joi, celebrate } = require("celebrate");
const {
  getUsers,
  getUsersById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require("../controllers/users");
userRoutes.get("/", getUsers);
userRoutes.get("/me", getCurrentUser);
userRoutes.get(
  "/:id",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().alphanum().length(24),
    }),
  }),
  getUsersById
);
userRoutes.patch(
  "/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).default("Жак-Ив Кусто"),
      about: Joi.string().min(2).max(30).default("Исследователь"),
      avatar: Joi.string().uri(),
    }),
  }),
  updateUser
);
userRoutes.patch("/me/avatar", updateAvatar);
module.exports = userRoutes;
