import {React, useState, useEffect, useContext, useRef} from 'react'
import "./quizmain.css";
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import {
    Redirect
} from "react-router-dom";
import {Row, Col, Container, ProgressBar, Button, Form} from "react-bootstrap";
import QuizReview from "./../../components/quiz-review/QuizReview";

function QuizMain(props) {
    const {user} = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const [quizInfo, setQuizInfo] = useState([]);
    const [point, setPoint] = useState(0);
    const [currentQuest, setCurrentQuest] = useState(0);
    const [quizTime, setQuizTime] = useState(false)
    const [time, setTime] = useState(0);
    const timerCount = useRef(0);
    const [currentAnswersSet, setCurrentAnswersSet] = useState([]);
    const [timeCountDown, setTimeCountDown] = useState("");
    const [timerCountInterval, setTimerCountInterval] = useState(0);
    const [answerFieldClass, setAnswerFieldClass] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [answersOld, setAnswersOld] = useState([]);
    const [currentAnswerField, setCurrentAnswerField] = useState("");
    const [answered, setAnswered] = useState(false);
    const [answerDisplay, setAnswerDisplay] = useState("");
    const [correctQuestCount, setCorrectQuestCount] = useState(0);
    const [answerBoxContent, setAnswerBoxContent] = useState("");
    const [markCompleted, setMarkCompleted] = useState(false);
    const [quizReviewModalShow, setQuizReviewModalShow] = useState(false);
    const [quizReviewModal, setQuizReviewModal] = useState(false);
    const [directToHome, setDirectToHome] = useState(false);

    const shuffleArray = (array) => {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }

    const toHHMMSS = (secs) => {
        var sec_num = parseInt(secs, 10)
        var hours   = Math.floor(sec_num / 3600)
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60
    
        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
    }

    const nextQuest = () => {
        if (quizTime && questions[currentQuest].question_time != null)
        {
            setTime(questions[currentQuest].question_time)
        }
        setCurrentQuest(currentQuest + 1)
    }

    const lastQuest = () => {
        setCurrentQuest(currentQuest - 1)
    }

    const finish = async(mode) => {
        if (mode === 1) {
            const info = {
                user_id: user.id,
                quiz_id: props.location.state.id,
                point: point, 
                time: null,
                correct: correctQuestCount,
                details: answersOld
            }
            setQuizReviewModal(true);
            await axios.post("/quiz/attempt", info)
            .then(res => {
                console.log("Done");
                setQuizReviewModalShow(true);
            })
            .catch(err => {

            })
        } else {
            if (!answered) {
                //Check answers
                let point = 0;
                let correctQuestCount = 0;
                let getTmpOldAnswers = [];
                for (let i = 0; i < answers.length; i++) {
                    if (questions[i].question_type === 0) {
                        //MCQ question
                        getTmpOldAnswers.push({
                            answer: answers[i],
                            mark: false,
                            question_id: questions[i].id,
                            point: 0
                        })
                        for (let j = 0; j < questions[i].answers.length; j++) {
                            let getAnswer = questions[i].answers[j];
                            if (getAnswer.id === answers[i]) {
                                if (getAnswer.is_correct === 1) {
                                    getTmpOldAnswers[i].mark = true;
                                    getTmpOldAnswers[i].point = questions[i].question_point;
                                    point += questions[i].question_point
                                    correctQuestCount++;
                                    break;
                                }
                            }
                        }
                    } else {
                        getTmpOldAnswers.push({
                            answer: answers[i],
                            mark: false,
                            question_id: questions[i].id,
                            point: 0
                        })
                        let markResult = checkTextAnswer(answers[i], Buffer(questions[i].answers[0].answer_content, "base64").toString("utf-8"));
                        if (markResult) {
                            getTmpOldAnswers[i].mark = true;
                            getTmpOldAnswers[i].point = questions[i].question_point;
                            point += questions[i].question_point
                            correctQuestCount++;
                        }
                    }
                }
                setAnswersOld(getTmpOldAnswers);
                setPoint(point);
                setCorrectQuestCount(correctQuestCount);
                setAnswered(true);
                clearInterval(timerCountInterval);
                setAnswerFieldClass(true);
                setMarkCompleted(true);
            }
        }
    }

    useEffect(async() => {
        if (!quizTime && markCompleted) {
            const info = {
                user_id: user.id,
                quiz_id: props.location.state.id,
                point: point, 
                time: quizInfo["quiz_time"] - timerCount.current < 0? 0 : quizInfo["quiz_time"] - timerCount.current,
                correct: correctQuestCount,
                details: answersOld
            }
            setQuizReviewModal(true);
            await axios.post("/quiz/attempt", info)
            .then(res => {
                console.log("Done");
                setQuizReviewModalShow(true);
            })
            .catch(err => {

            })
        }
    }, [markCompleted])

    useEffect(() => {
        console.log(questions);
    }, [questions])

    const getQuizInfo = async() => {
        let thisQuizInfo = await axios.get(`/quiz/info/${props.location.state.id}`);
        console.log(thisQuizInfo);
        thisQuizInfo = JSON.parse(thisQuizInfo.request.response);
        setQuizInfo(thisQuizInfo[0]);
        setQuizTime(thisQuizInfo[0]["quiz_time"] == null);
        if (thisQuizInfo[0]["quiz_time"] != null) {
            setTime(parseInt(thisQuizInfo[0]["quiz_time"]))
            timerCount.current = parseInt(thisQuizInfo[0]["quiz_time"])
            setTimeCountDown(toHHMMSS(timerCount.current));
        }

        let listOfQuestions = await axios.get(`/quiz/join/${props.location.state.id}`);
        listOfQuestions = JSON.parse(listOfQuestions.request.response);
        if (thisQuizInfo[0]["raw_order"] == 0) {
            listOfQuestions = await shuffleArray(listOfQuestions);
        }
        setQuestions(listOfQuestions);

        if (!quizTime) {
            for (let i = 0; i < listOfQuestions.length; i++) {
                answers.push("");
            }
            setAnswers(answers);
        }
    }

    const checkAnswerMCQ = (answer_id) => {
        if (!answered) {
            if (quizTime) {
                let getTmpOldAnswers = answersOld;
                getTmpOldAnswers.push({
                    answer: answer_id,
                    mark: false,
                    question_id: questions[currentQuest - 1].id,
                    point: 0
                }) 
                setAnswered(true);
                for (let i = 0; i < questions[currentQuest - 1].answers.length; i++) {
                    let getAnswer = questions[currentQuest - 1].answers[i];
                    if (getAnswer.id === answer_id) {
                        if (getAnswer.is_correct === 1) {
                            setPoint(point + questions[currentQuest - 1].question_point);
                            setCorrectQuestCount(correctQuestCount + 1);
                            getTmpOldAnswers[currentQuest - 1].mark = true;
                            getTmpOldAnswers[currentQuest - 1].point = questions[currentQuest - 1].question_point;
                            break;
                        }
                    }
                }
                setAnswersOld(getTmpOldAnswers);
                console.log(timerCountInterval);
                clearInterval(timerCountInterval);
            }
        }
        if (!quizTime) {
            let getTmpAnswer = answers;
            getTmpAnswer[currentQuest - 1] = answer_id;
            setAnswers(getTmpAnswer);
        }
    }

    const checkAnswerText = (e) => {
        if (!answered) {
            if (quizTime) {
                if (e.key == "Enter") {
                    e.preventDefault();
                    setAnswered(true);
                    let getTmpOldAnswers = answersOld;
                    getTmpOldAnswers.push({
                        answer: e.target.value,
                        mark: false,
                        question_id: questions[currentQuest - 1].id,
                        point: 0
                    })
                    let answersList = Buffer(questions[currentQuest - 1].answers[0].answer_content, "base64").toString("utf-8");
                    answersList = answersList.split("~|")
                    setAnswerDisplay(answersList[0].replace("~>", ", ").replace("~+", ", "));
                    let markResult = checkTextAnswer(e.target.value, Buffer(questions[currentQuest - 1].answers[0].answer_content, "base64").toString("utf-8"));
                    if (markResult) {
                        setPoint(point + questions[currentQuest - 1].question_point);
                        setCorrectQuestCount(correctQuestCount + 1);
                        getTmpOldAnswers[currentQuest - 1].mark = true;
                        getTmpOldAnswers[currentQuest - 1].point = questions[currentQuest - 1].question_point;
                    }
                    setAnswersOld(getTmpOldAnswers);
                    setAnswerFieldClass(true);
                    clearInterval(timerCountInterval);
                }
            }
        }
    }

    const checkAnswerTextFromTimeOut = (mode, answer) => {
        if (mode === 0) {
            let getTmpOldAnswers = answersOld;
            getTmpOldAnswers.push({
                answer: answer,
                mark: false,
                question_id: questions[currentQuest - 1].id,
                point: 0
            }) 
            setAnswered(true);
            setAnswersOld(getTmpOldAnswers);
        } else {
            setAnswered(true);
            let getTmpOldAnswers = answersOld;
            getTmpOldAnswers.push({
                answer: answer,
                mark: false,
                question_id: questions[currentQuest - 1].id,
                point: 0
            })
            setAnswersOld(getTmpOldAnswers);
            let answersList = Buffer(questions[currentQuest - 1].answers[0].answer_content, "base64").toString("utf-8");
            answersList = answersList.split("~|")
            setAnswerDisplay(answersList[0].replace("~>", ", ").replace("~+", ", "));
            setAnswerFieldClass(true);
        }
    }

    const checkTextAnswer = (answer, key) => {
        key = key.replaceAll("~|", "|");
        let keyArr = key.split("|");
        let mark = false;
        for (let i = 0; i < keyArr.length; i++) {
            let tmpAnswer = answer.trim().toUpperCase();
            let tmpAnswer1 = tmpAnswer;
            console.log(tmpAnswer1);
            console.log(keyArr[i].toUpperCase());
            console.log(tmpAnswer1 == keyArr[i].toUpperCase())
            if (tmpAnswer1 == keyArr[i].toUpperCase()) {
                mark = true;
            } else if (keyArr[i].includes("~>")) {
                let tmpMark = true;
                let tmpStr = keyArr[i].replaceAll("~>", "|");
                let tmpKeyArr = tmpStr.split("|");
                let tmpAnswerForModify = tmpAnswer1;
                if (tmpAnswerForModify.includes(" , ")) tmpAnswerForModify = tmpAnswer1.replaceAll(" , ", "|");
                if (tmpAnswerForModify.includes(" ,")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(" ,", "|");
                if (tmpAnswerForModify.includes(", ")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(", ", "|");
                if (tmpAnswerForModify.includes(",")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(",", "|");
                if (tmpAnswerForModify.includes(" - ")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(" - ", "|");
                if (tmpAnswerForModify.includes("- ")) tmpAnswerForModify = tmpAnswerForModify.replaceAll("- ", "|");
                if (tmpAnswerForModify.includes(" -")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(" -", "|");
                if (tmpAnswerForModify.includes("-")) tmpAnswerForModify = tmpAnswerForModify.replaceAll("-", "|");
                if (tmpAnswerForModify.includes("|")) {
                    let tmpSubAnswerArr = tmpAnswerForModify.Split('|');
                    if (tmpSubAnswerArr.length != tmpKeyArr.length) {
                        tmpMark = false;
                    } else {
                        let tmp = true;
                        for (let a = 0; a < tmpSubAnswerArr.length; a++) {
                            if (tmpSubAnswerArr[a] != tmpKeyArr[a].toUpperCase()) {
                                tmp = false;
                                break;
                            }
                        }
                        if (!tmp) {
                            tmpMark = false;
                        }
                    }
                } else {
                    if (tmpAnswerForModify.length != tmpKeyArr.length) {
                        tmpMark = false;
                    } else {
                        let tmp = true;
                        for (let a = 0; a < tmpAnswerForModify.length; a++) {
                            if (tmpAnswerForModify[a].toString() != tmpKeyArr[a].toUpperCase()) {
                                tmp = false;
                                break;
                            }
                        }
                        if (!tmp) {
                            tmpMark = false;
                        }
                    }
                }
                mark = tmpMark;
            } else if (keyArr[i].includes("~+")) {
                let tmpMark = true;
                let tmpStr = keyArr[i].replaceAll("~+", "|");
                let tmpKeyArr = tmpStr.split("|");
                let tmpAnswerForModify = tmpAnswer1;
                if (tmpAnswerForModify.includes(" , ")) tmpAnswerForModify = tmpAnswer1.replaceAll(" , ", "|");
                if (tmpAnswerForModify.includes(" ,")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(" ,", "|");
                if (tmpAnswerForModify.includes(", ")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(", ", "|");
                if (tmpAnswerForModify.includes(",")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(",", "|");
                if (tmpAnswerForModify.includes(" - ")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(" - ", "|");
                if (tmpAnswerForModify.includes("- ")) tmpAnswerForModify = tmpAnswerForModify.replaceAll("- ", "|");
                if (tmpAnswerForModify.includes(" -")) tmpAnswerForModify = tmpAnswerForModify.replaceAll(" -", "|");
                if (tmpAnswerForModify.includes("-")) tmpAnswerForModify = tmpAnswerForModify.replaceAll("-", "|");
                if (tmpAnswerForModify.includes("|")) {
                    let tmpSubAnswerArr = tmpAnswerForModify.Split('|');
                    if (tmpSubAnswerArr.length != tmpKeyArr.length) {
                        tmpMark = false;
                    } else {
                        for (let a = 0; a < tmpSubAnswerArr.length; a++) {
                            let found = false;
                            for (let b = 0; b < tmpKeyArr.length; b++)
                            {
                                if (tmpSubAnswerArr[a] == tmpKeyArr[b].toUpperCase()) 
                                {
                                    found = true;
                                    break;
                                }

                            }
                            if (!found)
                            {
                                tmpMark = false;
                                break;
                            }
                        }
                    }
                } else {
                    if (tmpAnswerForModify.length != tmpKeyArr.length) {
                        tmpMark = false;
                    } else {
                        for (let a = 0; a < tmpAnswerForModify.length; a++)
                        {
                            let found = false;
                            for (let b = 0; b < tmpKeyArr.length; b++)
                            {
                                if (tmpAnswerForModify[a].toString() == tmpKeyArr[b].toUpperCase())
                                {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found)
                            {
                                tmpMark = false;
                                break;
                            }
                        }
                    }
                }
                mark = tmpMark;
            }
            if (mark)
                break;
        }
        return mark;
    }

    const handleBoxChange = (e) => {
        if (!quizTime) {
            let getAnswers = [...answers];
            getAnswers[currentQuest - 1] = e.target.value;
            setCurrentAnswerField(e.target.value);
            setAnswers(getAnswers);
        } else {
            setAnswerBoxContent(e.target.value);
        }
    }

    useEffect(() => {
        if (quizInfo.length == 0) {
            getQuizInfo();
        }
    }, [])

    useEffect(() => {
        if (quizTime) {
            clearInterval(timerCountInterval);
            setAnswered(false);
            setAnswerDisplay("");
            setAnswerFieldClass(false);
            setAnswerBoxContent("");
        }

        if (currentQuest != 0) {
            let getAnswers = questions[currentQuest - 1].answers;
            getAnswers = shuffleArray(getAnswers);
            setCurrentAnswersSet(getAnswers);

            if (!quizTime) {
                setCurrentAnswerField(answers[currentQuest - 1]);
            }
        }
        if (currentQuest == 1) {
            if (quizTime && questions[currentQuest - 1].question_time != null)
            {
                console.log(questions[currentQuest - 1].question_time)
                setTime(questions[currentQuest].question_time)
                timerCount.current = questions[currentQuest].question_time;
                setTimeCountDown(toHHMMSS(timerCount.current));
            }

            let getTime = quizTime? questions[currentQuest - 1].question_time : time;

            if (quizTime)
            {
                timerCount.current = getTime;
                setTimeCountDown(toHHMMSS(timerCount.current));
            }
            let timerCountInterval = setInterval(() => {
                timerCount.current = timerCount.current - 1;
                setTimeCountDown(toHHMMSS(timerCount.current));
                if (timerCount.current == 0) {
                    clearInterval(timerCountInterval);
                    timerCount.current = 0;
                    setTimeCountDown("00:00");
                    setAnswerFieldClass(true);
                    if (quizTime) {
                        if (questions[currentQuest - 1].question_type === 0)
                            checkAnswerTextFromTimeOut(0, -1);
                        else
                            checkAnswerTextFromTimeOut(1, "");
                    }
                }
            }, 1000);
            setTimerCountInterval(timerCountInterval);
            console.log(timerCountInterval);
        } 
        if (currentQuest != 0 && currentQuest != 1 && quizTime) {
            let getTime = quizTime? questions[currentQuest - 1].question_time : time;

            if (quizTime)
            {
                timerCount.current = getTime;
                setTimeCountDown(toHHMMSS(timerCount.current));
            }
            let timerCountInterval = setInterval(() => {
                timerCount.current = timerCount.current - 1;
                setTimeCountDown(toHHMMSS(timerCount.current));
                if (timerCount.current == 0) {
                    clearInterval(timerCountInterval);
                    timerCount.current = 0;
                    setTimeCountDown("00:00");
                    setAnswerFieldClass(true);
                    if (quizTime) {
                        if (questions[currentQuest - 1].question_type === 0)
                            checkAnswerTextFromTimeOut(0, -1);
                        else
                            checkAnswerTextFromTimeOut(1, "");
                    }
                }
            }, 1000);
            setTimerCountInterval(timerCountInterval);
        }
    }, [currentQuest])

    return (
        <>
            {!quizReviewModal && questions.length == 0 && (<p>Loading Questions</p>)}
            {!quizReviewModal && questions.length != 0 && (
                <Container className="mt-3 mb-3">
                    <h1 className="text-center">{quizInfo.quiz_title}</h1>
                    <h3 className="text-center">Tạo bởi: {quizInfo.creator}</h3>
                    <Row className="">
                        <Col lg={4} md={12} sm={12}>
                            <h5 className="text-center">{user.username}</h5>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <h5 className="text-center">Câu hỏi: {currentQuest}/{questions.length}</h5>
                        </Col>
                        <Col lg={4} md={6} sm={12}>
                            <h5 className="text-center">Điểm: {point}</h5>
                        </Col>
                    </Row>
                    <h5 className="text-center">
                        Thời gian: {timeCountDown}
                    </h5>
                    {/* <div className="progress mb-2">
                        <ProgressBar 
                            variant="info"
                            striped 
                            now={progressBarWidth}
                            style={{width: '100%'}}
                        ></ProgressBar>
                        
                    </div> */}
                    <div className="text-center">
                        
                    </div>
                    {currentQuest == 0 && (
                        <div className="text-center">
                            <Button onClick={() => setCurrentQuest(1)} variant="info" className="text-white text-center">Bắt đầu</Button>
                        </div>
                    )}
                    {currentQuest != 0 && 
                        <>
                        <div className="question-box d-flex justify-content-center align-items-center">
                            <h5 className="txt-quest">{questions[currentQuest - 1].question_content}</h5>
                        </div>
                        {questions[currentQuest - 1].media != "" && <div className="text-center mt-2">
                            <img className="img-quest" src={questions[currentQuest - 1].media}></img>
                        </div>}
                        {questions[currentQuest - 1].question_type == 1 && 
                        <div>
                            {
                                
                                !quizTime && 
                                (<Form.Control value={currentAnswerField} disabled={answerFieldClass} type="text" className="mt-2" placeholder="Câu trả lời" onKeyPress={(e) => checkAnswerText(e)} onChange={(e) => handleBoxChange(e)}>
                                </Form.Control>)
                            }
                            {
                                quizTime && (
                                    <Form.Control value={answerBoxContent} disabled={answerFieldClass} type="text" className="mt-2" placeholder="Câu trả lời" onKeyPress={(e) => checkAnswerText(e)} onChange={(e) => handleBoxChange(e)}>
                                    </Form.Control>
                                )
                            }
                        </div>}
                        {questions[currentQuest - 1].question_type == 0 && 
                            <Row className="mt-2">
                                {
                                    currentAnswersSet.map((answer, i) => {
                                        let chosen = !quizTime && answers[currentQuest - 1] == answer.id? "answer-content text-center chosen": "answer-content text-center";
                                        if (quizTime && answered) {
                                            if (answer.is_correct == 1)
                                                chosen = "answer-content text-center correct"
                                            else 
                                                chosen = "answer-content text-center wrong"
                                        }
                                        return (
                                            <Col lg={6} md={6} sm={12} className="p-1 answer">
                                                <div className={chosen} onClick={() => checkAnswerMCQ(answer.id)}>
                                                    {answer.media != "" && <img className="img-answer" src={answer.media}></img>}
                                                    {Buffer(answer.answer_content, "base64").toString("utf-8")}
                                                </div>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                        }
                        {
                            quizTime && answered && (
                                <div className="text-center mt-1">
                                    {
                                        questions[currentQuest - 1].answers.length == 1 && (
                                            <h5>Đáp án: {answerDisplay}</h5>
                                        )
                                    }
                                    <h5>{Buffer(questions[currentQuest - 1].explanation, "base64").toString("utf-8")}</h5>
                                </div>
                            )
                        }
                        </>
                    }
                </Container>
            )}
            {!quizReviewModal && !quizTime && currentQuest != 0 && (
                <>
                {!answered && (
                    <div className="text-center">
                    {currentQuest != 1 && (<Button onClick={() => lastQuest()} variant="info" className="text-white text-center" style={{marginRight: "5px"}}>Trước</Button>)}
                    {currentQuest != questions.length && (<Button onClick={() => nextQuest()} variant="info" className="text-white text-center ml-1">Tiếp</Button>)}
                    </div>
                )}
                <div className="text-center mt-2">
                    <Button onClick={() => finish(0)} variant="info" className="text-white text-center">Hoàn thành</Button>
                </div>
                </>
            )}
            {
                !quizReviewModal && quizTime && currentQuest != 0 && currentQuest != answers.length && answered && (
                    <div className="text-center">
                        <Button onClick={() => nextQuest()} variant="info" className="text-white text-center">Tiếp</Button>
                    </div>
                )
            }
            {
                !quizReviewModal && quizTime && answered && currentQuest != 0 && currentQuest == answers.length && (
                    <div className="text-center mt-2">
                        <Button onClick={() => finish(1)} variant="info" className="text-white text-center">Hoàn thành</Button>
                    </div>
                )
            }

            {
                quizReviewModal && <><QuizReview
                    show={quizReviewModalShow}
                    onHide={() => setQuizReviewModalShow(false)}
                    reviewContent={answersOld}
                    questions={questions}
                    quizInfo={quizInfo}
                >

                </QuizReview>
                <div className="mt-3 text-center mb-3">
                    <Button variant="info" className="text-white" onClick={() => setDirectToHome(true)}>Kết thúc</Button>
                </div>
                </>
            }

            {
                directToHome && <Redirect to="/home"></Redirect>
            }
        </>
    )
}

export default QuizMain
