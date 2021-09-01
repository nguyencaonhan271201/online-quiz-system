import "./quizcreate.css";
import {React, useState, useEffect, useContext, useRef} from 'react'
import QuestionAddModal from "./../../components/question-add-modal/QuestionAddModal";
import QuestionEditModal from "./../../components/question-edit-modal/QuestionEditModal";
import {AuthContext} from "../../context/AuthContext";
import axios from "axios";
import {Paper, Chip} from "@material-ui/core";

//Bootstrap
import {Container, Col, Row, Form, Button, Modal} from "react-bootstrap";

//Material UI icons
import {Add} from "@material-ui/icons";  

export default function QuizCreate() {
    const {user} = useContext(AuthContext);
    const [quizTitle, setQuizTitle] = useState("");
    const [quizCode, setQuizCode] = useState("");
    const [quizMode, setQuizMode] = useState(0);
    const [quizTime, setQuizTime] = useState("");
    const [numberOfQuest, setNumberOfQuest] = useState(0)
    const [useQuizTime, setUseQuizTime] = useState(false);
    const [questionList, setQuestionList] = useState([]);
    const [addQuestionModalShow, setAddQuestionModalShow] = useState(false);
    const [submittedQuizDetails, setSubmittedQuizDetails] = useState(false);
    const [quizDetailError, setQuizDetailError] = useState("");
    const [timeUnit, setTimeUnit] = useState(0);
    const [editQuestionModalShow, setEditQuestionModalShow] = useState(false);
    const [questionEditGet, setQuestionEditGet] = useState(null);
    const [rawOrder, setRawOrder] = useState(false);
    const [errorModalShowing, setErrorModalShowing] = useState(false);
    const [error, setError] = useState("");

    const onQuizModeChange = (type) => {
        setQuizMode(type);
    }

    const onAddQuestionSubmit = (input) => {
        setQuestionList([...questionList, input]);
        setAddQuestionModalShow(false);
    }

    const onEditQuestionSubmit = (input) => {
        let cloneArray = [...questionList];
        let {questIndex, ...content} = input;
        cloneArray[input["questIndex"]] = content;
        setQuestionList(cloneArray);
        setEditQuestionModalShow(false);
    }

    useEffect(() => {
        setNumberOfQuest(questionList.length);
    }, [questionList])

    const submitQuizDetails = () => {
        //Validate info
        if (quizTitle === "") {
            setQuizDetailError("Vui lòng nhập tiêu đề Quiz.");
            return;
        }
        if (quizMode === 1 && quizCode === "") {
            setQuizDetailError("Vui lòng nhập mật khẩu Quiz.");
            return;
        }
        if (useQuizTime && isNaN(parseInt(quizTime))) {
            setQuizDetailError("Thời gian quiz không hợp lệ.");
            return;
        }

        //Pass validation
        setSubmittedQuizDetails(true);
    }

    const editQuestion = (index) => {
        let getQuest = questionList[index];
        getQuest["questIndex"] = index;
        setQuestionEditGet(getQuest);
        setEditQuestionModalShow(true);
    }

    const addQuiz = async() => {
        const newQuiz = {
            quiz_title: quizTitle, 
            quiz_mode: quizMode,
            quiz_creator: user.id,
            raw_order: rawOrder
        }

        let cloneQuestionList = [...questionList];
        for (let i = 0; i < cloneQuestionList.length; i++) {
            cloneQuestionList[i]["questIndex"] = i;
        }

        //Quiz code
        if (quizCode !== "")
            newQuiz["quiz_code"] = quizCode;

        //Quiz time
        if (useQuizTime)
        {
            newQuiz["quiz_time"] = timeUnit == 0? quizTime * 60 : quizTime;
        }

        newQuiz["questions"] = cloneQuestionList;

        axios.post("/quiz/create", newQuiz)
        .then(res => {
            //Do nothing
        })
        .catch(err => {
            if (err.response.status === 403) {
                setError("Mã trận đã tồn tại. Vui lòng sử dụng mã khác");
                setErrorModalShowing(true);
            } else if (err.response.status === 500) {
                setError("Đã có lỗi xảy ra. Vui lòng thử lại sau");
                setErrorModalShowing(true);
            }
        });
    }

    return (
        <div>
            <Container className="p-4">
                <h1 className="text-center">Tạo Quiz</h1>

                <Row>
                    <Col md={8} sm={12} className="offset-md-2 offset-sm-0">
                        <Form id="quizDetailForm">
                            <fieldset disabled={submittedQuizDetails? "disabled" : ""}>
                                <Form.Group className="mb-2" controlId="formBasicEmail">
                                    <Form.Label>Tiêu đề</Form.Label>
                                    <Form.Control type="text" required validate="Quiz name is not valid!"
                                    onChange={(e) => setQuizTitle(e.target.value)}/>
                                </Form.Group>
                                <fieldset>
                                    <Form.Group as={Row} className="mb-2">
                                    <Form.Label as="legend" column sm={12}>
                                        Chế độ:
                                    </Form.Label>
                                    <Col sm={12}>
                                        <Form.Check
                                            type="radio"
                                            label="Công khai"
                                            name="quiz-mode"
                                            checked={quizMode === 0}
                                            onChange={() => onQuizModeChange(0)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Riêng tư"
                                            name="quiz-mode"
                                            checked={quizMode === 1}
                                            onChange={() => onQuizModeChange(1)}
                                        />
                                    </Col>
                                    </Form.Group>
                                </fieldset>
                                <Form.Group className="mb-2" controlId="formBasicEmail">
                                    <Form.Label>Mật khẩu</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        validate="Quiz password is not valid!" 
                                        minLength={6} maxLength={10}
                                        disabled = {quizMode === 0 && "disabled"}
                                        onChange = {(e) => setQuizCode(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="formBasicEmail">
                                    <Form.Check 
                                        label="Thời gian" 
                                        onChange = {() => setUseQuizTime(!useQuizTime)} 
                                    />
                                    <Form.Text muted>
                                        Lựa chọn và nhập thời gian làm bài cho toàn bộ quiz hoặc không lựa chọn và đặt thời gian riêng lẻ cho từng câu hỏi.
                                    </Form.Text>
                                    <Row>
                                        <Col sm={9}>
                                            <Form.Control 
                                                type="number"
                                                min = {1}
                                                validate="Quiz password is not valid!" 
                                                disabled = {!useQuizTime && "disabled"}
                                                onChange = {(e) => {setQuizTime(e.target.value)}}
                                            />
                                        </Col>
                                        <Col sm={3} className="d-flex align-items-center">
                                            <Form.Check 
                                                type="radio"
                                                inline
                                                label="phút" 
                                                name="time-mode"
                                                disabled = {!useQuizTime && "disabled"}
                                                checked = {useQuizTime && timeUnit === 0}
                                                onChange = {() => setTimeUnit(0)}
                                            />
                                            <Form.Check 
                                                type="radio"
                                                inline
                                                label="giây" 
                                                name="time-mode"
                                                disabled = {!useQuizTime && "disabled"}
                                                checked = {useQuizTime && timeUnit === 1}
                                                onChange = {() => setTimeUnit(1)}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Check 
                                        label="Giữ thứ tự câu hỏi" 
                                        checked={rawOrder}
                                        onChange={() => setRawOrder(!rawOrder)}
                                    />
                                    <Form.Text muted>
                                        Nếu không chọn, câu hỏi sẽ được sắp xếp ngẫu nhiên.
                                    </Form.Text>
                                </Form.Group>
                                {!submittedQuizDetails && (<div className="text-center mt-3">
                                    <p className="error">{quizDetailError}</p>
                                    <Button variant="success" onClick={() => submitQuizDetails()}>
                                        Xác nhận thông tin Quiz
                                    </Button>
                                </div>)}
                            </fieldset>
                        </Form>
                        {submittedQuizDetails && (<Row className="mt-2">
                            <h3 className="text-center">Câu hỏi</h3>
                            <div className="text-center">
                                <Button variant="info" style={{paddingLeft: 15, paddingRight: 15}} onClick={() => setAddQuestionModalShow(true)}>
                                    <Add fontSize="small" style={{ color: "white"}}></Add>
                                </Button>
                            </div>
                            <p className="mt-2 text-center" >Số lượng câu hỏi: {numberOfQuest}</p>
                            {
                                questionList.map((quest, index) => {
                                    return ( 
                                        <div className="mt-2 mb-2 questionBox" key={quest["question"]}>
                                            <p className="quest-title"><b>Câu {index + 1}: </b>{quest["question"]}</p>
                                            {quest["time"] !== 0 && <p className="quest-title">Thời gian: {quest["time"]} giây</p> }
                                            <p className="quest-title">Điểm số: {quest["point"]}</p>
                                            {quest["image"] !== "" &&
                                                <img className="question-image" alt="" src={quest["image"]}></img>
                                            }
                                            <div className="quest-content">
                                                {quest["questionType"] === 1 && (
                                                    <>
                                                        <p className="mb-1">Đáp án:</p>
                                                        <Paper component="ul">
                                                            {quest["keys"][0].split("~>").map((choice, index) => {
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
                                                )}
                                                {quest["questionType"] === 0 && (
                                                    quest["keys"].map((key, index) => {
                                                        return (
                                                        <>
                                                        <p className={quest["keyCorrects"][index]? "correct-key" : "incorrect-key"}>
                                                            Phương án {index + 1}: {key}
                                                        </p>
                                                        {quest["keyImages"][index] !== "" &&
                                                            <div className="text-center">
                                                                <img className="key-image" alt="" src={quest["keyImages"][index]}></img>
                                                            </div>
                                                        }
                                                        </>)
                                                    })
                                                )}
                                                {quest["explain"] !== "" && (
                                                    <p>Giải thích: {quest["explain"]}</p>
                                                )}
                                            </div>
                                            <Button className="mt-1" variant="warning" onClick={() => editQuestion(index)}>Chỉnh sửa</Button>
                                        </div>
                                     )
                                })
                            }
                        </Row>)}
                        {submittedQuizDetails && (
                            <div className="text-center">
                                <Button variant="success" onClick={() => addQuiz()}>Xác nhận</Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            <QuestionAddModal
                show={addQuestionModalShow}
                onHide={() => setAddQuestionModalShow(false)}
                numberOfQuest={numberOfQuest}
                onAddQuestionSubmit={onAddQuestionSubmit}
                useQuizTime={useQuizTime}
            >

            </QuestionAddModal>

            {
                questionEditGet && <QuestionEditModal
                    show={editQuestionModalShow}
                    onHide={() => setEditQuestionModalShow(false)}
                    onEditQuestionSubmit={onEditQuestionSubmit}
                    useQuizTime={useQuizTime}
                    questionEditGet={questionEditGet}
                >

                </QuestionEditModal>
            }

            {
                errorModalShowing && (<Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={errorModalShowing}
                    >
                    <Modal.Header>  
                        Lỗi
                    </Modal.Header>
                    <Modal.Body>
                        {error}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setErrorModalShowing(false)}>Đóng</Button>
                    </Modal.Footer>
                </Modal>)
            }

        </div>
    )
}