const jwt = require("jsonwebtoken");
const { Users } = require("../models/Users");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Users.findById(verified.userId);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Unauthorized. Account inactive." });
    }

    req.user = verified;
    req.user.status = user?.status;
    next();
  } catch (error) {
    console.log(error, "Check");
    res.status(401).json({ error: "Invalid token." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin" && req.user.status === "active") {
    next();
  } else {
    return res.status(403).json({ error: "Unauthorized. Admins only." });
  }
};

const isPresenter = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "publisher" || req.user.role === "admin") &&
    req.user.status === "active"
  ) {
    next();
  } else {
    return res.status(403).json({
      error: "Unauthorized, only publishers can access this resource",
    });
  }
};

const isAuthor = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "author" || req.user.role === "admin") &&
    req.user.status === "active"
  ) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Unauthorized. Only authors can access this resource" });
  }
};

module.exports = { verifyToken, isAdmin, isPresenter, isAuthor };
