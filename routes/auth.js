
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Signup page
router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

// Create user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).render("signup", {
        error: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).render("signup", {
        error: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).render("signup", {
        error: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
      // Role defaults to "user"
    });

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role
    };

    res.redirect("/");
  } catch (error) {
    console.error(error);

    res.status(500).render("signup", {
      error: "Signup failed. Please try again."
    });
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !password ||
        !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render("login", {
        error: "Invalid email or password"
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Login failed");
      }

      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role
      };

      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("login", {
      error: "Login failed. Please try again."
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
