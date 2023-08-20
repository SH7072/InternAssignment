const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config({
    path: ".env",
});
const cors = require("cors");

// db Connection
const pool = require("./dbConnection");

// importing routes
const user = require("./Routes/userRoutes");
const journal = require("./Routes/journalRoutes");



// middleware
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(
    cors({
        origin: "*",
        credentials: false,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

//Error
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});


// Routes
app.use("/user", user);
app.use("/journal", journal);



const port = process.env.PORT || 3000;

app.use("/", (req,res) => {
    res.send(`<h1>Hello from server</h1>`);
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

pool.on('connect', () => {
    console.log('connected to the Database');
  });
