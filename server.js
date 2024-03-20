// Imports
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const uuid = require('./helpers/uuid');
const dbData = require('./db/db.json');

const PORT = 3001;

const app = express();

// Middleware
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbFilePath = path.resolve(__dirname, './db/db.json');

// HTML Routes

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

// API routes
app.get('/api/notes', async (req, res) => {
  try{
    const data = await fs.readFile(dbFilePath, 'utf-8');
    const notes = JSON.parse(data);
    
    res.json(notes);

  } catch(err) {
    console.error('Unable to read db.json file', err);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, text } = req.body;

    const newNote = {
      title,
      text,
      id: uuid(),
    };

    const data = await fs.readFile(dbFilePath, 'utf-8');
    const notes = JSON.parse(data);
    notes.push(newNote);
    await fs.writeFile(dbFilePath, JSON.stringify(notes, null, 2));

    res.status(201).json(newNote);
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await fs.readFile(dbFilePath, 'utf-8');
    const notes = JSON.parse(data);
    const note = notes.find(note => note.note_id === id);
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', err);
    res.status(500).json({ error: 'Internal server error' });

  }
});
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await fs.readFile(dbFilePath, 'utf-8');
    let notes = JSON.parse(data);
    notes = notes.filter(note => note.note_id === id);
    await fs.writeFile(dbFilePath, JSON.stringify(notes, null, 2));
    res.status(204).send(); // No content is returned after successful deletion
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));


app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);

