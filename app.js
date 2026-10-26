
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// CSS and uploaded files
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// Make logged-in user available in EJS files
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Book REST APIs
app.use("/api/books", require("./routes/bookApi"));

// Authentication routes
app.use("/", require("./routes/auth"));

// Website routes
app.use("/", require("./routes/bookWeb"));

// Start server
async function startServer() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Book APIs: http://localhost:${PORT}/api/books`);
      console.log(`Signup: http://localhost:${PORT}/signup`);
      console.log(`Login: http://localhost:${PORT}/login`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

if (!process.env.SESSION_SECRET || !process.env.MONGO_URI) {
  console.error("Missing SESSION_SECRET or MONGO_URI in .env");
  process.exit(1);
}

startServer();
