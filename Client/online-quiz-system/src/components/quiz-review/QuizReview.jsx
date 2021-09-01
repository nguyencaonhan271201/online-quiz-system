import "./quiz-review.css";
import {React, useState, useEffect, useRef} from 'react'
import {Container, Row, Col, Form} from "react-bootstrap";
import {Chip, Paper} from '@material-ui/core';

function QuizReview(props) {
    const [markContent, setMarkContent] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [quizInfo, setQuizInfo] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setMarkContent(props.reviewContent);
        setQuestions(props.questions);
        setQuizInfo(props.quizInfo);
    }, [])

    useEffect(() => {
        if (questions.length > 0) {
            setLoaded(true);
            console.log(questions);
        }
    }, [markContent])

    return (
        <>
            {loaded && <Container className="mt-3 mb-3">
                <h1 className="text-center">{quizInfo.quiz_title}</h1>
                <h3 className="text-center">Tạo bởi: {quizInfo.creator}</h3>
                <h5 className="text-center">Kết quả</h5>
                {questions.map((question, i) => {
                    return (
                    <div key={i} class="mt-3 mb-3">
                        <h5>Câu {i + 1} - {markContent[i].point}/{question.question_point}</h5>
                        <div className="question-box d-flex justify-content-center align-items-center">
                            <h5 className="txt-quest">{question.question_content}</h5>
                        </div>
                        {question.media != "" && <div className="text-center mt-2">
                            <img className="img-quest" src={question.media}></img>
                        </div>}
                        {question.question_type == 1 && 
                        <div>
                            <Form.Control value={markContent[i].answer} disabled="true" type="text" className="mt-2" placeholder="Câu trả lời">
                            </Form.Control>
                            <div className="text-center mt-1">
                                {
                                    <>
                                    <h5>Đáp án:</h5>
                                    <Paper component="ul">
                                        {Buffer(question.answers[0].answer_content, "base64").toString("utf-8").split("~|")
                                        .map((choice, index) => {
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
                                <p style={{fontStyle: "italic"}}>Giải thích: {Buffer(question.explanation, "base64").toString("utf-8")}</p>
                            </div>
                        </div>}
                        {question.question_type == 0 && 
                            <>
                            <Row className="mt-2">
                                {
                                    question.answers.map((answer, j) => {
                                        let chosen = "";
                                        if (answer.id !== markContent[i].answer) {
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
                            <p style={{fontStyle: "italic"}} className="text-center">Giải thích: {Buffer(question.explanation, "base64").toString("utf-8")}</p>
                            </>
                        }
                    </div>)
                })
                }
            </Container>}
        </>
    )
}

export default QuizReview

/*
                        
*/