import "./home.css";
import {React, useState, useEffect, useContext} from 'react';
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import {Row, Col, Container, Card, Button, Modal, Form, Nav} from "react-bootstrap";
import {Redirect} from "react-router-dom";
import {PlayCircleFilled, Dashboard} from "@material-ui/icons";

//Load quiz thumbnails
import Thumnail1 from "./../../assets/images/quiz1.png";
import Thumnail2 from "./../../assets/images/quiz2.png";
import Thumnail3 from "./../../assets/images/quiz3.png";

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
    const [dashboardQuizID, setDashboardQuizID] = useState(-1);

    const getQuizzes = async() => {
        let listOfQuizzes = await axios.get("https://online-quiz-system-server.herokuapp.com/api/quiz/public");
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
        await axios.post(`https://online-quiz-system-server.herokuapp.com/api/quiz/join_check`, info)
        .then(res => {
            setQuizID(parseInt(res.data))
        })
        .catch(err => {
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
                console.log(err.response.data);
                if (err.response.data == 0) {
                    setError("Bạn đã tham gia quiz này!");
                    setModalShowing(true);
                } else {
                    checkAttempts(err.response.data);
                }
                return;
            }
        }   
        );
    }

    useEffect(() => {
        getQuizzes();    
    }, [])

    const checkAttempts = (quiz_id) => {
        setDashboardQuizID(quiz_id);
    }
    
    return (
        <>
            <Container className="mt-3 mb-3 quiz-list">
                <div>
                    <h1 className="text-center">Danh sách Quiz</h1>
                </div>
                <Nav variant="tabs" defaultActiveKey="/home">
                    <Nav.Item>
                        <Nav.Link active>Công khai</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link onClick={() => setPasswordModalShowing(true)}>Riêng tư</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Row className="mt-2 mb-2">
                    {
                        /* Show public quizzes */
                        publicQuizzes.map((quiz, index) => {
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
                            let image = index % 3 === 0? Thumnail1 : index % 3 === 1 ? Thumnail2 : Thumnail3;
                            return (
                                <Col className="quiz-choose-box pl-3 pr-3 pt-2 pb-2" lg={4} sm={6} md={6} xs={12}>
                                    <Card style={{ width: 'auto' }}>
                                    <Card.Img variant="top" src={image}/>
                                    <Card.Body>
                                        <Card.Title className="text-center"><b>{quiz.quiz_title}</b></Card.Title>
                                        <Card.Text className="quiz-info">
                                            Tạo bởi: {quiz.fullname} <br></br>
                                            Số câu hỏi: {quiz.number_of_quests} <br/>
                                            {quiz.quiz_time && <p>Thời gian: {time}</p>}
                                            {!quiz.quiz_time && <p>Thời gian: theo câu</p>}
                                        </Card.Text>
                                        {quiz.quiz_creator !== user.id && 
                                            <div className="text-end">
                                                <Button 
                                                    variant="info" 
                                                    className="text-white btn-rounded" 
                                                    onClick={() => joinQuiz(quiz.id, "")}>
                                                        <PlayCircleFilled></PlayCircleFilled> Tham gia
                                                </Button>
                                            </div>
                                        }
                                        {quiz.quiz_creator === user.id && 
                                            <div className="text-end">
                                                <Button 
                                                    variant="warning" 
                                                    className="text-white btn-rounded" 
                                                    onClick={() => checkAttempts(quiz.id)}>
                                                        <Dashboard></Dashboard> Xem kết quả
                                                </Button>
                                            </div>
                                        }
                                    </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })
                    }
                </Row>
            </Container>     
            {quizID !== -1 && renderRedirect()} 
            {dashboardQuizID !== -1 && <Redirect
            to={{
                pathname: '/dashboard',
                state: {
                    id: dashboardQuizID,
                }
            }}
            />} 
            {
                (modalShowing || passwordModalShowing) && (<Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={modalShowing || passwordModalShowing}
                    >
                    <Modal.Header>  
                        <h5>{modalShowing && "Lỗi"}
                        {passwordModalShowing && "Nhập mã trận"}</h5>
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
                            <Button variant="danger" className="btn-rounded" onClick={() => setPasswordModalShowing(false)}>Đóng</Button>
                            <Button variant="success" className="btn-rounded" onClick={() => joinQuiz(-2, quizPass)}>Xác nhận</Button>
                        </>
                        )}
                    </Modal.Footer>
                </Modal>)
            }
        </>
    )
}
