const express = require("express");
const { signUp, signIn } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);

module.exports = router;
