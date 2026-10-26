
const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// Home page
router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .limit(6);

    res.render("home", { books });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading homepage");
  }
});

// Display all books with search
router.get("/books", async (req, res) => {
  try {
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const books = await Book.find(filter).sort({ createdAt: -1 });

    res.render("books", { books, search });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading books");
  }
});

// Show add book form
router.get("/books/add", (req, res) => {
  res.render("add-book", { error: null });
});

// Add new book
router.post("/books/add", async (req, res) => {
  try {
    const { title, author, category, price, stock, description } = req.body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category?.trim() ||
      price === "" ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      (stock !== "" && stock !== undefined &&
        (!Number.isInteger(Number(stock)) || Number(stock) < 0))
    ) {
      return res.status(400).render("add-book", {
        error: "Please enter valid book details."
      });
    }

    await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      price: Number(price),
      stock: stock === "" || stock === undefined ? 0 : Number(stock),
      description
    });

    res.redirect("/books");
  } catch (error) {
    console.error(error);
    res.status(400).render("add-book", {
      error: error.message
    });
  }
});

// Show book details
router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.render("book-details", { book });
  } catch (error) {
    res.status(400).send("Invalid book ID");
  }
});

// Show edit form
router.get("/books/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.render("edit-book", { book, error: null });
  } catch (error) {
    res.status(400).send("Invalid book ID");
  }
});

// Update book
router.post("/books/:id/edit", async (req, res) => {
  try {
    const { title, author, category, price, stock, description } = req.body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category?.trim() ||
      price === "" ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      stock === "" ||
      stock === undefined ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).send("Please enter valid book details.");
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        description
      },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.redirect("/books");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating book");
  }
});

// Delete book
router.post("/books/:id/delete", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.redirect("/books");
  } catch (error) {
    res.status(400).send("Error deleting book");
  }
});

router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).render("error", {
        message: "Book not found"
      });
    }

    res.render("book-details", { book });
  } catch (error) {
    res.status(400).render("error", {
      message: "Invalid book ID"
    });
  }
});

module.exports = router;
