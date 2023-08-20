const pool = require("../dbConnection")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createJournal = async (req, res, next) => {

    try {

        const userId = req.userId;
        // console.log(userId);

        const { studentList, description, published } = req.body;
        let p = new Date(published)
        let url = req.file.location;
        if (!url) {
            const link = req.body;
            if (!link) {
                url = '';
            }
            else {
                url = link;
            }
        }

        const isStudentQuery = `
        
        SELECT * FROM users WHERE username = $1
        `;

        // console.log(studentList[0]);
        for (let stud = 0; stud < studentList.length; stud++) {
            let studentName = studentList[stud];
            console.log(studentName);
            const isStudentValues = [studentName];
            const rslt = await pool.query(isStudentQuery, isStudentValues)
            const student = rslt.rows[0];
            // console.log(rslt);
            if (student.role != 'student') {
                const error = new Error("You can only tag students in the journal");
                if (!error.statusCode) {
                    error.statusCode = 404;
                }
                throw error;
            }
        }

        const insertJournalQuery = `
        INSERT INTO journal (description, user_id, student_list, published, files)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, description, student_list, user_id, published, files;
        `;
        const insertJournalValues = [description, userId, studentList, p, url];
        let result = await pool.query(insertJournalQuery, insertJournalValues);
        const newJournal = result.rows[0];
        res.status(200).json(
            {
                message: "Journal created",
                newJournal
            });

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteJournal = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { journalId } = req.params;
        const getJournalQuery = `
        SELECT * FROM journal
        WHERE id=$1;
        `;
        const getJournalValues = [journalId];
        const result = await pool.query(getJournalQuery, getJournalValues);
        const journal = result.rows[0];
        if (!journal) {
            const error = new Error("Journal not found");
            if (!error.statusCode) {
                error.statusCode = 404;
            }
            throw error;
        }
        console.log(userId, journal.user_id);
        if (journal.user_id != userId) {
            const error = new Error("Not authorized");
            if (!error.statusCode) {
                error.statusCode = 403;
            }
            throw error;
        }
        const deleteJournalQuery = `
        DELETE FROM journal
        WHERE id=$1;
        `;
        const deleteJournalValues = [journalId];
        await pool.query(deleteJournalQuery, deleteJournalValues);
        res.status(200).json(
            {
                message: "Journal deleted"
            }
        );

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
    }
}

exports.getJournalFeed = async (req, res, next) => {
    try {

        const userId = req.userId;
        let currDate = Date.now();
        currDate = new Date(currDate);
        // const user=req.user;
        const existingUserQuery = 'SELECT * FROM users WHERE id = $1';
        const existingUserValues = [userId];
        const user = await pool.query(existingUserQuery, existingUserValues);
        let journals = [];
        // console.log(user.rows[0].role);

        if (user.rows[0].role == 'teacher') {
            //get all journals which are created by the teacher
            // console.log('hehe');
            const getJournalsQuery = `
            SELECT * FROM journal
            WHERE user_id=$1;
            `;
            const getJournalsValues = [userId];
            const result = await pool.query(getJournalsQuery, getJournalsValues);
            // console.log(result.rows.length );
            for (let i = 0; i < result.rows.length; i++) {
                // check created time and if it is less than current date then push it to journals else discard
                const date = new Date(result.rows[i].published);
                // console.log(date,currDate);
                if (date < currDate) {
                    journals.push(result.rows[i]);

                }

            }
        }
        if (user.role == 'student') {


            const getJournalsQuery = `
            SELECT *
            FROM journal
            WHERE $1 = ANY (student_list);
            `;
            const getJournalsValues = [req.username];

            const result = await pool.query(getJournalsQuery, getJournalsValues);
            if (result[i].published < date) {
                journals.push(result[i]);

            }
        }
        res.status(200).json(
            {
                message: "Journals Fetched",
                journals: journals
            }
        );

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.updateJournal = async (req, res, next) => {

    try {
        const { journalId } = req.params;
        const userId = req.userId;
        const { description, studentList, published } = req.body;
        let p = new Date(published);
        let url = req.file.location;
        if (!url) {
            const link = req.body;
            if (!link) {
                url = '';
            }
            else {
                url = link;
            }
        }
        const getJournalQuery = `
        SELECT * FROM journal
        WHERE id=$1;
        `;
        const getJournalValues = [journalId];
        //check for the user who is trying to update a post
        const journal = await pool.query(getJournalQuery, getJournalValues);
        if (journal.rows[0].user_id != userId) {
            const error = new Error("Not authorized");
            if (!error.statusCode) {
                error.statusCode = 403;
            }
            throw error;
        }

        const isStudentQuery = `
        
        SELECT * FROM users WHERE username = $1
        `;

        // console.log(studentList[0]);
        for (let stud = 0; stud < studentList.length; stud++) {
            let studentName = studentList[stud];
            console.log(studentName);
            const isStudentValues = [studentName];
            const rslt = await pool.query(isStudentQuery, isStudentValues)
            const student = rslt.rows[0];
            // console.log(rslt);
            if (student.role != 'student') {
                const error = new Error("You can only tag students in the journal");
                if (!error.statusCode) {
                    error.statusCode = 404;
                }
                throw error;
            }
        }

        const query = "UPDATE journal SET description=$1," +
            "student_list=$2, published=$3, files=$4 WHERE id=$5 RETURNING *";
        const values = [description, studentList, p, url,journalId];
        console.log('values', values);
        const updatedJournalData = await pool.query(query, values);
        
        console.log('Updated Journal Data', updatedJournalData);
        res.status(200).json(
            {
                message: "Journal updated",
                updatedJournalData
            }
        );

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
    }
}