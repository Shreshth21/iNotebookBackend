const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const decodeToken = require('../middleware/getUser')
const Note = require('../models/Note');

//ROUTE-1: Get all notes from DB
router.get("/fetchallnotes", decodeToken, async (req, res) => {
    const note = await Note.find({ user: req.user.id });
    res.json(note);
});


//ROUTE-2: Create a new note
router.post("/addnote", decodeToken, [
    body('title').isLength({ min: 3 }),
    body('description').isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ errors: error.array() });
        }
        const note = new Note({
            title, description, tag,
            user: req.user.id
        });
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server error" + error.message);
    }

});



//ROUTE-3: Update a note
router.put("/updateNote/:id", decodeToken, async (req, res) => {

    const { title, description, tag } = req.body;
    let note = await Note.findById(req.params.id);

    //check if note exists
    if (!note) {
        return res.status(401).send("Note not found :(");
    }

    // check if the user is accessing his notes only
    if (req.user.id !== note.user.toHexString()) {
        return res.status(401).send("Not authorized!");
    }

    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
});


router.delete("/deleteNote/:id", decodeToken, async (req, res) => {

    let note = await Note.findById(req.params.id);
    //check if note exists
    if (!note) {
        return res.status(401).send("Note not found :(");
    }

    // check if the user is accessing his notes only
    if (req.user.id !== note.user.toHexString()) {
        return res.status(401).send("Not authorized!");
    }

    const result = await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "delete successfully", note :result });
});

module.exports = router;