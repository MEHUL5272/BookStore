
const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// GET all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new book
router.post("/", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({
      message: "Book added successfully",
      data: book
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET single book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: "Invalid book ID" });
  }
});

// PUT update book
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({
      message: "Book updated successfully",
      data: book
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE book
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid book ID" });
  }
});

module.exports = router;
