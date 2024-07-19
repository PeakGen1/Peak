const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/timeline', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const eventSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    date: String,
    color: String,
    importance: Number,
    details: String
});

const noteSchema = new mongoose.Schema({
    content: String
});

const Event = mongoose.model('Event', eventSchema);
const Note = mongoose.model('Note', noteSchema);

// Routes
app.get('/events', async (req, res) => {
    const events = await Event.find();
    res.send(events);
});

app.post('/events', async (req, res) => {
    const event = new Event(req.body);
    await event.save();
    res.send(event);
});

app.delete('/events/:id', async (req, res) => {
    await Event.deleteOne({ id: req.params.id });
    res.send({ success: true });
});

app.get('/notes', async (req, res) => {
    const notes = await Note.findOne();
    res.send(notes);
});

app.post('/notes', async (req, res) => {
    await Note.deleteMany(); // Ensure only one note document exists
    const note = new Note({ content: req.body.content });
    await note.save();
    res.send(note);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
