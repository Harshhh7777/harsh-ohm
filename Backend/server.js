// ================= Dependencies =================
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sendEmail = require('./mailer'); // ✅ PLACE IT HERE


const app = express();

// ================= Middlewares =================
app.use(cors());
app.use(express.json());

// ================= MongoDB Connection =================
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio')

  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// ================= Models =================
const Comment = require('./models/Comment');
const Contact = require('./models/Contact');

// ================= API Routes =================

// -------- COMMENTS --------
app.post('/api/comments', async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save();

    // Send email
    await sendEmail({
      subject: "💬 New Comment on Portfolio",
      text: `${newComment.name} said: ${newComment.message}`,
      html: `<p><strong>${newComment.name}</strong> commented:<br>${newComment.message}</p>`,
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to save comment' });
  }
});


app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ timestamp: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to fetch comments' });
  }
});

app.patch('/api/comments/:id/reactions', async (req, res) => {
  const { id } = req.params;
  const { reaction } = req.body;
  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.reactions[reaction] = (comment.reactions[reaction] || 0) + 1;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: '❌ Could not update reaction' });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to delete comment' });
  }
});

// -------- CONTACT --------
app.post('/api/contact', async (req, res) => {
  try {
    const contactEntry = new Contact(req.body);
    await contactEntry.save();

    // Send email
    await sendEmail({
      subject: "📩 New Contact Submission",
      text: `Name: ${contactEntry.name}\nEmail: ${contactEntry.email}\nMessage: ${contactEntry.message}`,
      html: `<p><strong>${contactEntry.name}</strong> sent a message:</p><p>${contactEntry.message}</p>`,
    });

    res.status(201).json({ msg: '✅ Contact form submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: '❌ Failed to submit form' });
  }
});
  

// ================= Serve Frontend =================
const frontendPath = path.join(__dirname, '../Frontend');
app.use(express.static(frontendPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});





// ================= Start Server =================
const PORT = process.env.PORT || 5050;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
