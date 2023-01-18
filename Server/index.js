const express = require("express");
const app = express();
const mysql = require("mysql");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const authRoute = require("./routes/auth");
const quizRoute = require("./routes/quiz");
const questionRoute = require("./routes/question");
const router = express.Router();
const path = require("path");
const cors = require("cors");

dotenv.config();

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors(
    {origin: true}
));

app.use("/api/auth", authRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/question", questionRoute);

const port = process.env.PORT || 7773;
app.listen(port, () => {
    console.log(`Backend server is listening on port ${port}...`);
})