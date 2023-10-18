const jwt = require("jsonwebtoken");
const Status = require("../utils/statusCodes");

const handleAuthError = (res) => {
  res.status(Status.UNAUTHORIZED).send({ message: "Необходима авторизация" });
};

const extractBearerToken = (header) => {
  return header.replace('Bearer ', '');
};

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res);
  }
  const token = extractBearerToken(authorization)
  let payload;
  try {
    payload = jwt.verify(token, "super-secret");
  } catch (err) {
    return handleAuthError(res);
  }
  req.user = payload;
  next();
};
