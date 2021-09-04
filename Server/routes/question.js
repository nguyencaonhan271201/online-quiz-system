const router = require('express').Router();
const mysql = require('mysql');

const query = require('../helper/query');

const conn = mysql.createConnection({
    host: 'remotemysql.com',
    user: 'WSPIdrQDfo',
    password: 'm2zWYqHv4V',
    database: 'WSPIdrQDfo',
});
  
conn.connect(function(err){
    if (err)
        console.log(err);
});

//Quiz section
router.post("/question/create", async(req, res) => {
    try {
        var params = [
            req.body.quiz_id,
            req.body.question_raw_id,
            req.body.question_type,
            req.body.question_content,
            req.body.media? req.body.media : null,
            req.body.question_point,
            req.body.question_time? req.body.question_time : null,
        ]

        try {
            const result = await query(conn, "INSERT INTO questions(quiz_id, question_raw_id, question_type, question_content, media, question_point, question_time, date_created)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 HOUR))", params);
            res.status(200).send("Question created");
        } catch (err) {
            res.status(500).send(err.message);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put("/question/:id", async(req, res) => {
    try {
        let findQuestion = await query(conn, "SELECT * FROM questions WHERE id = ?", [req.params.id]).catch(console.log);
        if (findQuestion.length == 0)
            return res.status(404).send("Question not found"); 

        findQuestion = await query(conn, "SELECT q.quiz_creator FROM quizzes q JOIN questions q1 ON q.id = q1.quiz_id WHERE q1.id = ?", [req.params.id]).catch(console.log);
        findQuestion = JSON.parse(JSON.stringify(findQuestion))[0];

        //Check creator
        if (req.body.userID !== findQuestion['quiz_creator'])
            return res.status(403).send("You can only update questions of your quiz");

        //Check for duplicate
        var params = [
            req.body.question_type,
            req.body.question_content,
            req.body.media? req.body.media : null,
            req.body.question_point,
            req.body.question_time? req.body.question_time : null,
            req.params.id
        ]

        try {
            const result = await query(conn, "UPDATE questions SET question_type = ?, question_content = ?, media = ?, question_point = ?, question_time = ? WHERE id = ?", params);
            res.status(200).send("Question updated");
        } catch (err) {
            res.status(500).send(err.message);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;