import "./home.css";
import {React, useState, useEffect, useContext} from 'react';
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import {Row, Col, Container, Card, Button, Modal, Form} from "react-bootstrap";
import {Redirect} from "react-router-dom";

import QuizCreate from "./../quiz-create/QuizCreate";


export default function Home() {
    const {user} = useContext(AuthContext);
    const [mode, setMode] = useState(0);
    const [publicQuizzes, setPublicQuizzes] = useState([]);
    const [quizChosen, setQuizChosen] = useState(false);
    const [quizID, setQuizID] = useState(-1);
    const [quizPass, setQuizPass] = useState("");
    const [quizValid, setQuizValid] = useState(false);
    const [error, setError] = useState("");
    const [modalShowing, setModalShowing] = useState(false);
    const [passwordModalShowing, setPasswordModalShowing] = useState(false);

    const getQuizzes = async() => {
        let listOfQuizzes = await axios.get("/quiz/public");
        listOfQuizzes = JSON.parse(listOfQuizzes.request.response);
        setPublicQuizzes(listOfQuizzes);
    }

    const renderRedirect = () => {
        return <Redirect
            to={{
                pathname: '/join',
                state: {
                    id: quizID,
                    pass: quizPass
                }
            }}
        />
    }

    const joinQuiz = async(quizID, quizPass) => {
        setQuizPass(quizPass);
        setQuizChosen(true);

        if (quizID === -2) {
            setPasswordModalShowing(false);
        }

        //Validate pass
        const info = {
            id: quizID,
            pass: quizPass,
            user_id: user.id
        }
        await axios.post(`/quiz/join_check`, info).
            then(res => {
                setQuizID(parseInt(res.data))
            })
            .catch(
            err => {
                if (err.response.status === 404) {
                    //Wrong password
                    setError("Mật mã trận không đúng");
                    setModalShowing(true);
                    return;
                } else if (err.response.status === 500) {
                    setError("Đã xảy ra lỗi. Vui lòng thử lại.");
                    setModalShowing(true);
                    return;
                } else if (err.response.status === 403) {
                    setError("Bạn đã tham gia quiz này!");
                    setModalShowing(true);
                    return;
                }
            }
        );
    }

    useEffect(() => {
        getQuizzes();    
    }, [])
    
    return (
        <>
            <Container className="mt-3 mb-3">
                <h1 className="text-center">List of Quizzes</h1>
                <div className="text-center">
                    <Button variant="info" className="text-white" onClick={() => setPasswordModalShowing(true)}>Trận riêng tư</Button>
                </div>
                <Row>
                    {
                        /* Show public quizzes */
                        publicQuizzes.map(quiz => {
                            //Check time
                            let time = "";
                            if (quiz.quiz_time && quiz.quiz_time != 0) {
                                if (quiz.quiz_time >= 3600) {
                                    let hours = parseInt(quiz.quiz_time / 3600);
                                    let minutes = parseInt((quiz.quiz_time - 3600 * hours) / 60);
                                    let seconds = quiz.quiz_time - 3600 * hours - 60 * minutes;
                                    time = `${hours} giờ`;
                                    if (minutes > 0)
                                        time += ` ${minutes} phút`;
                                    if (seconds > 0)
                                        time += ` ${seconds} giây`;
                                } else if (quiz.quiz_time >= 60) {
                                    let minutes = parseInt(quiz.quiz_time  / 60);
                                    let seconds = quiz.quiz_time - 60 * minutes;
                                    time = `${minutes} phút`;
                                    if (seconds > 0)
                                        time += ` ${seconds} giây`;
                                } else {
                                    time = (quiz.quiz_time).toString() + " giây";
                                }
                            }
                            return (
                                <Col className="quiz-choose-box p-2" lg={4} sm={6} md={6} xs={12}>
                                    <Card style={{ width: 'auto' }}>
                                    <Card.Img variant="top" src="https://images-na.ssl-images-amazon.com/images/I/71k5kfdB9KL.png"/>
                                    <Card.Body>
                                        <Card.Title className="text-center"><b>{quiz.quiz_title}</b></Card.Title>
                                        <Card.Text className="quiz-info">
                                            Tạo bởi: {quiz.fullname} <br></br>
                                            Số câu hỏi: {quiz.number_of_quests} <br/>
                                            {quiz.quiz_time && <p>Thời gian: {time}</p>}
                                        </Card.Text>
                                        <Button variant="info" className="text-white" onClick={() => joinQuiz(quiz.id, "")}>Tham gia</Button>
                                    </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })
                    }
                </Row>
            </Container>     
            {quizID !== -1 && renderRedirect()} 

            {
                (modalShowing || passwordModalShowing) && (<Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={modalShowing || passwordModalShowing}
                    >
                    <Modal.Header>  
                        {modalShowing && "Lỗi"}
                        {passwordModalShowing && "Nhập mã trận"}
                    </Modal.Header>
                    <Modal.Body>
                        {modalShowing && error}
                        {passwordModalShowing && <Form.Control value={quizPass} required type="text" className="mt-2" placeholder="Mã trận" onChange={(e) => setQuizPass(e.target.value)}>
                        </Form.Control>}
                    </Modal.Body>
                    <Modal.Footer>
                        {modalShowing && <Button onClick={() => setModalShowing(false)}>Đóng</Button>}
                        {passwordModalShowing && (
                        <>
                            <Button variant="danger" onClick={() => setPasswordModalShowing(false)}>Đóng</Button>
                            <Button variant="success" onClick={() => joinQuiz(-2, quizPass)}>Xác nhận</Button>
                        </>
                        )}
                    </Modal.Footer>
                </Modal>)
            }
        </>
    )
}
