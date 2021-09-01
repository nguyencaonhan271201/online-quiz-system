import "./quiz-review.css";
import {React, useState, useEffect, useRef} from 'react'
import {Container, Row, Col} from "react-bootstrap";
import {Chip, Paper} from '@material-ui/core';

function QuizReview(props) {
    const [markContent, setMarkContent] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [quizInfo, setQuizInfo] = useState([]);

    useEffect(() => {
        setMarkContent(props.reviewContent);
        setQuestions(props.questions);
        setQuizInfo(props.quizInfo);
    }, [])

    useEffect(() => {
        console.log(markContent);
    }, [markContent])

    return (
        <>
            <Container className="mt-3 mb-3">
                <h1 className="text-center">{quizInfo.quiz_title}</h1>
                <h3 className="text-center">Tạo bởi: {quizInfo.creator}</h3>
                {questions.map((i, question) => {
                    <div class="mt-1 mb-1">
                        <div className="question-box d-flex justify-content-center align-items-center">
                            <h5 className="txt-quest">{question.question_content}</h5>
                        </div>
                        {question.media != "" && <div className="text-center mt-2">
                            <img className="img-quest" src={question.media}></img>
                        </div>}
                        {question.question_type == 1 && 
                        <div>
                            <Form.Control value={answers[i].answer} disabled="true" type="text" className="mt-2" placeholder="Câu trả lời">
                            </Form.Control>
                            <div className="text-center mt-1">
                                {
                                    <>
                                    <p>Đáp án:</p>
                                    <Paper component="ul">
                                        {question.answers[0].split("~|").map((choice, index) => {
                                            return (
                                                <li key={index}>
                                                    <Chip
                                                        label={choice}
                                                    />
                                                </li>
                                            )
                                        })}
                                    </Paper>
                                    </>
                                }
                                <h5>{Buffer(questions[currentQuest - 1].explanation, "base64").toString("utf-8")}</h5>
                            </div>
                        </div>}
                        {question.question_type == 0 && 
                            <Row className="mt-2">
                                {
                                    question.answers.map((answer, j) => {
                                        let chosen = "";
                                        if (answer.id !== answers[i].answer) {
                                            if (answer.is_correct === 1) {
                                                chosen = "answer-content text-center correct";
                                            } else {
                                                chosen = "answer-content text-center";
                                            }
                                        } else {
                                            if (answer.is_correct === 1) {
                                                chosen = "answer-content text-center correct";
                                            } else {
                                                chosen = "answer-content text-center wrong";
                                            }
                                        }
                                        return (
                                            <Col lg={6} md={6} sm={12} className="p-1 answer">
                                                <div className={chosen}>
                                                    {answer.media != "" && <img className="img-answer" src={answer.media}></img>}
                                                    {Buffer(answer.answer_content, "base64").toString("utf-8")}
                                                </div>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                        }
                    </div>
                })
                }
            </Container>
        </>
    )
}

export default QuizReview
