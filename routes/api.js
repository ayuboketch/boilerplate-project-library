// routes/api.js
'use strict';
const mongoose = require('mongoose');

// Define Book schema and model
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function(app) {
  // CONNECT TO DB
  const db = process.env.DB;
  mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });

  app.route('/api/books')
    .post(async (req, res) => {
      const { title } = req.body;
      if (!title) return res.send('missing required field title');
      try {
        const book = new Book({ title, comments: [] });
        const saved = await book.save();
        res.json({ _id: saved._id, title: saved.title });
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .get(async (req, res) => {
      try {
        const books = await Book.find({});
        const formatted = books.map(b => ({
          _id: b._id,
          title: b.title,
          commentcount: b.comments.length
        }));
        res.json(formatted);
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .delete(async (req, res) => {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('server error');
      }
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.send('no book exists');
      try {
        const book = await Book.findById(id);
        if (!book) return res.send('no book exists');
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .post(async (req, res) => {
      const { id } = req.params;
      const { comment } = req.body;
      if (!comment) return res.send('missing required field comment');
      if (!mongoose.Types.ObjectId.isValid(id)) return res.send('no book exists');
      try {
        const book = await Book.findById(id);
        if (!book) return res.send('no book exists');
        book.comments.push(comment);
        const updated = await book.save();
        res.json({
          _id: updated._id,
          title: updated.title,
          comments: updated.comments
        });
      } catch (err) {
        res.status(500).send('server error');
      }
    })

    .delete(async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) return res.send('no book exists');
      try {
        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.status(500).send('server error');
      }
    });
};