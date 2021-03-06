import "./quizcreate.css";
import {React, useState, useEffect, useContext, useRef} from 'react'
import QuestionAddModal from "./../../components/question-add-modal/QuestionAddModal";
import QuestionEditModal from "./../../components/question-edit-modal/QuestionEditModal";
import {AuthContext} from "../../context/AuthContext";
import axios from "axios";
import {Paper, Chip} from "@material-ui/core";
import {
    Redirect
} from "react-router-dom";

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
    const [redirect, setRedirect] = useState(false);

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

    useEffect(async() => {
        //Check if is admin
        await axios.post("https://online-quiz-system-server.herokuapp.com/api/auth/check-admin", user)
        .then(res => {
            
        })
        .catch(err => {
            setRedirect(true);
        })
    }, []);

    const submitQuizDetails = () => {
        //Validate info
        if (quizTitle === "") {
            setQuizDetailError("Vui l??ng nh???p ti??u ????? Quiz.");
            return;
        }
        if (quizMode === 1 && quizCode === "") {
            setQuizDetailError("Vui l??ng nh???p m???t kh???u Quiz.");
            return;
        }
        if (useQuizTime && isNaN(parseInt(quizTime))) {
            setQuizDetailError("Th???i gian quiz kh??ng h???p l???.");
            return;
        }

        //Pass validation
        setSubmittedQuizDetails(true);
    }

    const editQuestion = (index) => {
        console.log(index);
        let getQuest = questionList[index];
        console.log(getQuest);
        getQuest["questIndex"] = index;
        setQuestionEditGet(getQuest);
    }

    const deleteQuestion = (index) => {
        let getQuest = [];
        for (let i = 0; i < index; i++) {
            getQuest.push(questionList[i]);
        }
        for (let i = index + 1; i < questionList.length; i++) {
            getQuest.push(questionList[i]);
        }
        setQuestionList(getQuest);
    }

    useEffect(() => {
        setEditQuestionModalShow(true);
    }, [questionEditGet])

    useEffect(() => {
        console.log(questionList);
    }, [questionList])

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

        //https://online-quiz-system-server.herokuapp.com/api/quiz/create
        axios.post("https://online-quiz-system-server.herokuapp.com/api/quiz/create", newQuiz)
        .then(res => {
            //Do nothing
            setRedirect(true);
        })
        .catch(err => {
            if (err.response.status === 403) {
                setError("M?? tr???n ???? t???n t???i. Vui l??ng s??? d???ng m?? kh??c");
                setErrorModalShowing(true);
            } else if (err.response.status === 500) {
                setError("???? c?? l???i x???y ra. Vui l??ng th??? l???i sau");
                setErrorModalShowing(true);
            }
        });
    }

    return (
        <div>
            <Container className="p-4">
                <h2 className="text-center">T???o Quiz</h2>

                <Row>
                    <Col md={8} sm={12} className="offset-md-2 offset-sm-0">
                        <Form id="quizDetailForm">
                            <fieldset disabled={submittedQuizDetails? "disabled" : ""}>
                                <Form.Group className="mb-2" controlId="formBasicEmail">
                                    <Form.Label>Ti??u ?????</Form.Label>
                                    <Form.Control type="text" required validate="Quiz name is not valid!"
                                    onChange={(e) => setQuizTitle(e.target.value)}/>
                                </Form.Group>
                                <fieldset>
                                    <Form.Group as={Row} className="mb-2">
                                    <Form.Label as="legend" column sm={12}>
                                        Ch??? ?????:
                                    </Form.Label>
                                    <Col sm={12}>
                                        <Form.Check
                                            type="radio"
                                            label="C??ng khai"
                                            name="quiz-mode"
                                            checked={quizMode === 0}
                                            onChange={() => onQuizModeChange(0)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Ri??ng t??"
                                            name="quiz-mode"
                                            checked={quizMode === 1}
                                            onChange={() => onQuizModeChange(1)}
                                        />
                                    </Col>
                                    </Form.Group>
                                </fieldset>
                                <Form.Group className="mb-2" controlId="formBasicEmail">
                                    <Form.Label>M???t kh???u</Form.Label>
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
                                        label="Th???i gian" 
                                        onChange = {() => setUseQuizTime(!useQuizTime)} 
                                    />
                                    <Form.Text muted>
                                        L???a ch???n v?? nh???p th???i gian l??m b??i cho to??n b??? quiz ho???c kh??ng l???a ch???n v?? ?????t th???i gian ri??ng l??? cho t???ng c??u h???i.
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
                                                label="ph??t" 
                                                name="time-mode"
                                                disabled = {!useQuizTime && "disabled"}
                                                checked = {useQuizTime && timeUnit === 0}
                                                onChange = {() => setTimeUnit(0)}
                                            />
                                            <Form.Check 
                                                type="radio"
                                                inline
                                                label="gi??y" 
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
                                        label="Gi??? th??? t??? c??u h???i" 
                                        checked={rawOrder}
                                        onChange={() => setRawOrder(!rawOrder)}
                                    />
                                    <Form.Text muted>
                                        N???u kh??ng ch???n, c??u h???i s??? ???????c s???p x???p ng???u nhi??n.
                                    </Form.Text>
                                </Form.Group>
                                {!submittedQuizDetails && (<div className="text-center mt-3">
                                    <p className="error">{quizDetailError}</p>
                                    <Button className="btn-rounded" variant="success" onClick={() => submitQuizDetails()}>
                                        X??c nh???n th??ng tin Quiz
                                    </Button>
                                </div>)}
                            </fieldset>
                        </Form>
                        {submittedQuizDetails && (<Row className="mt-2">
                            <h4 className="text-center">C??u h???i</h4>
                            <div className="text-center">
                                <Button className="btn-rounded" variant="info" style={{paddingLeft: 15, paddingRight: 15}} onClick={() => setAddQuestionModalShow(true)}>
                                    <Add fontSize="small" style={{ color: "white"}}></Add>
                                </Button>
                            </div>
                            <p className="mt-2 text-center" >S??? l?????ng c??u h???i: {numberOfQuest}</p>
                            {
                                questionList.map((quest, index) => {
                                    return ( 
                                        <div className="mt-2 mb-2 questionBox" key={quest["question"]}>
                                            <p className="quest-title"><b>C??u {index + 1}: </b>{quest["question"]}</p>
                                            {quest["time"] !== 0 && <p className="quest-title">Th???i gian: {quest["time"]} gi??y</p> }
                                            <p className="quest-title">??i???m s???: {quest["point"]}</p>
                                            {quest["image"] !== "" &&
                                                <img className="question-image" alt="" src={quest["image"]}></img>
                                            }
                                            <div className="quest-content">
                                                {quest["questionType"] === 1 && (
                                                    <>
                                                        <p className="mb-1">????p ??n:</p>
                                                        <Paper component="ul">
                                                            {quest["keys"][0].split("~|").map((choice, index) => {
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
                                                    quest["keys"].map((key, index1) => {
                                                        return (
                                                        <>
                                                        <p className={quest["keyCorrects"][index1]? "correct-key" : "incorrect-key"}>
                                                            Ph????ng ??n {index1 + 1}: {key}
                                                        </p>
                                                        {quest["keyImages"][index1] && quest["keyImages"][index1] !== "" &&
                                                            <div className="text-center">
                                                                <img className="key-image" alt="" src={quest["keyImages"][index1]}></img>
                                                            </div>
                                                        }
                                                        </>)
                                                    })
                                                )}
                                                {quest["explain"] !== "" && (
                                                    <p>Gi???i th??ch: {quest["explain"]}</p>
                                                )}
                                            </div>
                                            <Button className="btn-rounded mt-1" style={{marginRight: "3px"}} variant="danger" onClick={() => deleteQuestion(index)}>Xo??</Button>
                                            <Button className="btn-rounded mt-1 ml-1" variant="warning" onClick={() => editQuestion(index)}>Ch???nh s???a</Button>
                                        </div>
                                     )
                                })
                            }
                        </Row>)}
                        {submittedQuizDetails && (
                            <div className="text-center">
                                <Button className="btn-rounded" variant="success" onClick={() => addQuiz()}>X??c nh???n</Button>
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
                        L???i
                    </Modal.Header>
                    <Modal.Body>
                        {error}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setErrorModalShowing(false)}>????ng</Button>
                    </Modal.Footer>
                </Modal>)
            }

            {
                redirect && <Redirect to="/home"></Redirect>
            }
        </div>
    )
}