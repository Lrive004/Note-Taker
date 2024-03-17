// Imports
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const uuid = require('./helpers/uuid');

const PORT = 3001;

const app = express();

// Middleware
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbData = require('./db/db.json');


// HTML Routes
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/notes.html')));

// API routes
app.get('/api/notes', (req, res) => {
  return res.json(dbData);
});

app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a review`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;


  if (title && text) {
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };
    const reviewString = JSON.stringify(newNote);

    // Write the string to a file
    fs.writeFile(`./db/${newNote.title}.json`, reviewString, (err) =>
      err
        ? console.error(err)
        : console.log(
            `Review for ${newNote.title} has been written to JSON file`
          )
    );

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting review');
  }
});


app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
