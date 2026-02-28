const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();
const SECRET = "closingcircles_secret_key";

// Register Admin (Run once)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO admins (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Admin already exists" });
      }
      res.json({ message: "Admin registered successfully" });
    }
  );
});

// Login Admin
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM admins WHERE email = ?", [email], async (err, user) => {
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: "8h",
    });

    res.json({ token });
  });
});

module.exports = router;