const express = require("express");
const router = express.Router();

const { createJournal, deleteJournal, getJournalFeed, updateJournal } = require("../Controllers/journalController");
const { isAuth, isTeacher } = require("../middleware/isAuth");
const { uploadToS3 } = require("../middleware/s3");
// uploadToS3

//create Journal
router.post('/createJournal', isAuth, isTeacher, uploadToS3, createJournal);

//delete Journal
router.delete('/deleteJournal/:journalId', isAuth, isTeacher, deleteJournal);

//get Journal for a user
router.get('/getJournalFeed', isAuth, getJournalFeed);

//update Journal
router.put('/updateJournal/:journalId', isAuth, isTeacher, uploadToS3, updateJournal);

module.exports = router;
