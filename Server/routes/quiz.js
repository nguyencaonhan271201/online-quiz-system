const router = require('express').Router();
const mysql = require('mysql');

const query = require('../helper/query');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'online-quiz-system'
});
  
conn.connect(function(err){
    if (err)
        console.log(err);
});

//Quiz section
router.post("/create", async(req, res) => {
    try {
        var params = [
            req.body.quiz_title,
            req.body.quiz_mode,
            req.body.quiz_code? req.body.quiz_code : null,
            req.body.quiz_creator,
            req.body.quiz_time? req.body.quiz_time : null,
            req.body.raw_order
        ]

        try {
            if (params[2] != null) {
                //Prevent duplicate code
                var params1 = {
                    quiz_code: req.body.quiz_code
                }
                
                let findMatchSameCode = await query(conn, "SELECT * FROM quizzes WHERE ?", params1).catch(console.log);
                if (findMatchSameCode.length > 0)
                    return res.status(403).send("Mã trận trùng lắp. Vui lòng chọn mã khác");
            } 

            const result = await query(conn, "INSERT INTO quizzes(quiz_title, quiz_mode, quiz_code, quiz_creator, quiz_time, raw_order)" +
            " VALUES (?, ?, ?, ?, ?, ?)", params);
            
            let get_id = result.insertId;
            //Add questions
            var questionList = req.body.questions;
            questionList.forEach(async(question) => {
                //Question
                var quest_params = [
                    get_id,
                    question["questIndex"],
                    question["questionType"],
                    question["question"],
                    question["image"],
                    question["time"],
                    question["point"],
                    question["explain"]
                ]
                
                const result = await query(conn, "INSERT INTO questions(quiz_id, question_raw_id, question_type, question_content, media, question_point, question_time, explanation)" +
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?)", quest_params);

                let get_quest_id = result.insertId;
                for (let i = 0; i < question["keys"].length; i++) {
                    var key_params = [
                        get_quest_id,
                        question["keys"][i],
                        question["keys"].length > 1? 0 : 1,
                        i + 1,
                        question["keyCorrects"][i],
                        question["keyImages"][i],
                    ]

                    const execute = await query(conn, "INSERT INTO answer_keys(question_id, answer_content, answer_type, answer_subtype, is_correct, media)" +
                    " VALUES (?, ?, ?, ?, ?, ?)", key_params);
                }
            })

            res.status(200).send("Success");
        } catch (err) {
            res.status(500).send(err.message);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put("/edit/:id", async(req, res) => {
    try {
        let findQuiz = await query(conn, "SELECT * FROM quizzes WHERE id = ?", [req.params.id]).catch(console.log);
        if (findQuiz.length == 0)
            return res.status(404).send("Quiz not found"); 

        findQuiz = JSON.parse(JSON.stringify(findQuiz))[0];

        //Quiz found
        if (req.body.userID !== findQuiz['quiz_creator'])
            return res.status(403).send("You can only update your quiz");

        //Check for duplicate
        var params = [
            req.body.quiz_title,
            req.body.quiz_mode,
            req.body.quiz_code? req.body.quiz_code : null,
            req.body.quiz_creator,
            req.body.quiz_time? req.body.quiz_time : null,
            req.body.raw_order
        ]

        try {
            const result = await query(conn, "UPDATE quizzes SET quiz_title = ?, quiz_mode = ?, quiz_code = ?, quiz_creator = ?, quiz_time = ?, raw_order = ?", params);
            res.status(200).send("Quiz updated");
        } catch (err) {
            res.status(500).send(err.message);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

//Get public quizzes
router.get("/public", async (req, res) => {
    try {
        let quizzesList = await query(conn, "SELECT quizzes.*, users.fullname, (SELECT COUNT(*) FROM questions q WHERE q.quiz_id = quizzes.ID) AS number_of_quests " +
        "FROM quizzes JOIN users ON quizzes.quiz_creator = users.ID WHERE finished = 0 AND quiz_mode = 0").catch(console.log);
        res.status(200).send(JSON.parse(JSON.stringify(quizzesList)));
    } catch (err) {
        res.status(500).send(err.message);
    }
    
})

//Get quiz info
router.get("/info/:id", async(req, res) => {
    try {
        let quiz_id = req.params.id;
        try {
            //Check if a quiz is raw_order or not
            let quizInfos = await query(conn, "SELECT quiz_title, (SELECT fullname FROM users u WHERE u.id = quizzes.quiz_creator) as creator, quiz_time, raw_order FROM quizzes WHERE id = " + quiz_id)
            .catch(console.log);
            quizInfos = JSON.parse(JSON.stringify(quizInfos));
            res.status(200).send(quizInfos);
        } catch (err) {
            res.status(500).send(err.message);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
})

//Validate quiz join
router.post("/join_check", async(req, res) => {
    try {
        let quiz_id = req.body.id;
        if (quiz_id === -2) {
            //Find quiz by code
            var params1 = {
                quiz_code: req.body.pass
            }
            
            let findMatchSameCode = await query(conn, "SELECT * FROM quizzes WHERE ?", params1).catch(console.log);
            findMatchSameCode = JSON.parse(JSON.stringify(findMatchSameCode));
            if (findMatchSameCode.length == 0)
                return res.status(404).send("Wrong code");
            else {
                quiz_id = findMatchSameCode[0]["id"];

                let check = await query(conn, "SELECT * FROM quiz_attempts WHERE quiz_id = " + quiz_id + " AND user_id = " + req.body.user_id)
                .catch(console.log);
                check = JSON.parse(JSON.stringify(check));
                if (check.length > 0)
                    return res.status(403).send("Already joined");

                return res.status(200).send(quiz_id.toString())
            }
        } else {
            let check = await query(conn, "SELECT * FROM quiz_attempts WHERE quiz_id = " + quiz_id + " AND user_id = " + req.body.user_id)
            .catch(console.log);
            check = JSON.parse(JSON.stringify(check));
            if (check.length > 0)
                return res.status(403).send("Already joined");

            return res.status(200).send(quiz_id.toString())
        }      
    } catch (err) {
        res.status(500).send(err.message);
    }
})

//Join a public quiz
router.get("/join/:id", async(req, res) => {
    try {
        let quiz_id = req.params.id;
        try {
            //Check if a quiz is raw_order or not
            let questionsList = await query(conn, "SELECT * FROM questions WHERE quiz_id = " + quiz_id + " ORDER BY question_raw_id ASC")
            .catch(console.log);
            questionsList = JSON.parse(JSON.stringify(questionsList));
            for (let i = 0; i < questionsList.length; i++) {
                let question_id = questionsList[i].id;
                //Get answer
                let answers = await query(conn, "SELECT * FROM answer_keys WHERE question_id = " + question_id)
                .catch(console.log);
                answers = JSON.parse(JSON.stringify(answers));
                for (let i = 0; i < answers.length; i++) {
                    answers[i].answer_content = Buffer.from(answers[i].answer_content).toString('base64');
                }
                questionsList[i].explanation = Buffer.from(questionsList[i].explanation).toString('base64');
                questionsList[i]["answers"] = answers;
            }
            res.status(200).send(questionsList);
        } catch (err) {
            res.status(500).send(err.message);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
})

//Store attempt infomation
router.post("/attempt", async(req, res) => {
    try {
        //Get params for quiz_attempt table
        let params = [
            req.body.user_id,
            req.body.quiz_id,
            req.body.point,
            req.body.time,
            req.body.correct
        ];
        console.log(params);
        const result = await query(conn, "INSERT INTO quiz_attempts(user_id, quiz_id, point, time, correct)" +
        " VALUES (?, ?, ?, ?, ?)", params)
        .catch(console.log);
        
        let get_id = result.insertId;

        //Add details
        var detailsList = req.body.details;
        detailsList.forEach(async(detail) => {
            //Question
            var quest_params = [
                get_id,
                detail.question_id,
                detail.answer,
                detail.mark,
                detail.point
            ]
            
            const result = await query(conn, "INSERT INTO quiz_attempt_details(attempt_id, question_id, answer, is_correct, point)" +
            " VALUES (?, ?, ?, ?, ?)", quest_params)
            .catch(console.log);
        })

        res.status(200).send("Success");

    } catch (err) {
        res.status(500).send(err.message);
    }
})

module.exports = router;