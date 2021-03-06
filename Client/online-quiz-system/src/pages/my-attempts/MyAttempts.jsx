import "./my-attempts.css";
import {React, useState, useEffect, useContext} from 'react'
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import {Row, Col, Container, Button, Form, Table, Pagination} from "react-bootstrap";
import QuizReview from "./../../components/quiz-review/QuizReview";
  
function MyAttempts(props) {
    const {user} = useContext(AuthContext);
    const [quizInfo, setQuizInfo] = useState([]);
    const [recordsContent, setRecordsContent] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentShowing, setCurrentShowing] = useState([]);
    const [currentShowPerPage, setCurrentShowPerPage] = useState(20);
    const [pageRange, setPageRange] = useState([]);
    const [startEndIndex, setStartEndIndex] = useState([]);
    const [currentCriteria, setCurrentCriteria] = useState("5");
    const [currentSortAsc, setCurrentSortAsc] = useState("desc");
    const [quizReviewReady, setQuizReviewReady] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [details, setDetails] = useState([]);
    const [selectionName, setSelectionName] = useState("");
      
    const initializeTable = (dataLength) => {
        let maxPage = dataLength % currentShowPerPage === 0 ? parseInt(dataLength / currentShowPerPage) : parseInt(dataLength / currentShowPerPage) + 1;
        let buildPageRange = [];
        for (let i = 1; i <= maxPage; i++) {
            buildPageRange.push(i);
        } 
        setPageRange(buildPageRange)
        setStartEndIndex([dataLength > 0? 1 : 0, Math.min(currentShowPerPage, dataLength)])
    }

    const changePage = (pageNumber) => {
        let start = (pageNumber - 1) * currentShowPerPage + 1;
        let end = Math.min(pageNumber * currentShowPerPage, recordsContent.length);
        setCurrentPage(pageNumber);
        setStartEndIndex([start, end]);
        let getArray = recordsContent;
        let getSubArray = getArray.slice(start - 1, end);
        setCurrentShowing(getSubArray);
    }

    const sortRecord = (array, criteria, isAscending) => {
        let criteriaString = "";
        switch (criteria) {
            case 0: //ID
                criteriaString = "board_id";
                break;
            case 1: //Name
                criteriaString = "quiz_name";
                break;
            case 2: //Time
                criteriaString = "time";
                break;
            case 3: //Point
                criteriaString = "point";
                break;
            case 4: //Correct
                criteriaString = "correct";
                break;
            case 5: //Timestamp
                criteriaString = "date_created";
                break;  
        }
        if (criteria !== 5) {
            if (isAscending) {
                array.sort((a,b) => (a[criteriaString] > b[criteriaString]) ? 1 : ((b[criteriaString] > a[criteriaString]) ? -1 : 0))
            } else {
                array.sort((a,b) => (a[criteriaString] < b[criteriaString]) ? 1 : ((b[criteriaString] < a[criteriaString]) ? -1 : 0))
            }
        } else {
            if (isAscending) {
                array.sort((a,b) => (Date.parse(a["date_created"]) > Date.parse(b["date_created"])) ? 1 : ((Date.parse(b["date_created"]) > Date.parse(a["date_created"])) ? -1 : 0))
            } else {
                array.sort((a,b) => (Date.parse(a["date_created"]) < Date.parse(b["date_created"])) ? 1 : ((Date.parse(b["date_created"]) < Date.parse(a["date_created"])) ? -1 : 0))
            }
        }
        return array;
    }

    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds)
            return "";
        let time = "";
        if (timeInSeconds >= 3600) {
            let hours = parseInt(timeInSeconds / 3600);
            let minutes = parseInt((timeInSeconds - 3600 * hours) / 60);
            let seconds = timeInSeconds - 3600 * hours - 60 * minutes;
            time = `${hours} gi???`;
            if (minutes > 0)
                time += ` ${minutes} ph??t`;
            if (seconds > 0)
                time += ` ${seconds} gi??y`;
        } else if (timeInSeconds >= 60) {
            let minutes = parseInt(timeInSeconds / 60);
            let seconds = timeInSeconds - 60 * minutes;
            time = `${minutes} ph??t`;
            if (seconds > 0)
                time += ` ${seconds} gi??y`;
        } else {
            time = (timeInSeconds).toString() + " gi??y";
        }
        return time;
    }

    Number.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    const formatDate = (d) => {
        return `${d.getDate().pad(2)}/${(d.getMonth()+ 1).pad(2)}/${d.getFullYear()} ${d.getHours().pad(2)}:${d.getMinutes().pad(2)}:${d.getSeconds().pad(2)}`
    }

    const getInfo = async() => {
        await axios.post(`https://online-quiz-system-server.herokuapp.com/api/quiz/my_attempts`, {
            user_id: user.id,
        })
        .then(res1 => {
            res1.data = sortRecord(res1.data, 5, false);
            for (let i = 0; i < res1.data.length; i++) {
                Object.assign(res1.data[i], {"board_id": i + 1});
            }
            setRecordsContent(res1.data);
            initializeTable(res1.data.length);

            let getSubArray = res1.data;
            getSubArray = res1.data.slice(0, Math.min(currentShowPerPage, res1.data.length));
            setCurrentShowing(getSubArray);
        })
        .catch(err1 => {
            console.log(err1);
        });
               
    }

    const viewDetail = async(user, quiz, name) => {
        await axios.post("https://online-quiz-system-server.herokuapp.com/api/quiz/attempt_detail", {
            user_id: user,
            quiz_id: quiz
        })
        .then(async(res) => {
            let result = res.data;
            let getDetails = result.slice(0, result.length / 2);
            let getQuestions = result.slice(result.length / 2, result.length);
            for (let i = 0; i < getQuestions.length; i++) {
                if (getQuestions[i].question_type === 0) {
                    getDetails[i].answer = parseInt(getDetails[i].answer);
                }
            }
            setSelectionName(name);
            setDetails(getDetails);
            setQuestions(getQuestions);

            await axios.get(`https://online-quiz-system-server.herokuapp.com/api/quiz/info/${quiz}`)
            .then(async(res1) => {
                let thisQuizInfo = res1.data;
                setQuizInfo(thisQuizInfo[0]);
            })
            .catch(err1 => {
                console.log(err1);
            });
        })
        .catch(err => {

        })
    }

    const changeCriteria = (mode, value) => {
        if (mode === 0) {
            let getTmpData = recordsContent;
            getTmpData = sortRecord(getTmpData, parseInt(value), currentSortAsc === "asc");
            setRecordsContent(getTmpData);
            setCurrentCriteria(value);
        } else {
            let getTmpData = recordsContent;
            getTmpData = sortRecord(getTmpData, parseInt(currentCriteria), value === "asc");
            setRecordsContent(getTmpData);
            setCurrentSortAsc(value);
        }
    }

    useEffect(() => {
        let dataLength = recordsContent.length;
        let maxPage = dataLength % currentShowPerPage === 0 ? parseInt(dataLength / currentShowPerPage) : parseInt(dataLength / currentShowPerPage) + 1;
        let buildPageRange = [];
        for (let i = 1; i <= maxPage; i++) {
            buildPageRange.push(i);
        } 
        setPageRange(buildPageRange)
        setStartEndIndex([dataLength > 0? 1 : 0, Math.min(currentShowPerPage, dataLength)])
    }, [currentShowPerPage])

    useEffect(() => {
        changePage(1);
    }, [recordsContent])

    useEffect(() => {
        if (quizInfo.length === 0) {
            getInfo();
        }
    }, [])

    useEffect(() => {
        if (details.length !== 0 && questions.length !== 0 && details.length === questions.length && quizInfo.length !== 0) {
            setQuizReviewReady(true);
        }
    }, [details, questions, quizInfo])

    return (
        <Container className="mt-3 mb-3">
            {!quizReviewReady &&
            <>
            <h2 className="text-center">K???t qu??? c?? nh??n</h2>
            <Row className="mb-2">
                <Col lg={3} md={6} sm={12}>
                    <Form.Group>
                        <Form.Label>S???p x???p theo</Form.Label>
                        <Form.Control inline as="select" onChange={(e) => changeCriteria(0, e.target.value)} value={currentCriteria}>
                            <option value="0">#</option>
                            <option value="1">Quiz</option>
                            <option value="2">Th???i gian l??m b??i</option>
                            <option value="3">??i???m</option>
                            <option value="4">S??? c??u ????ng</option>
                            <option value="5">D???u th???i gian</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg={3} md={6} sm={12}>
                    <Form.Group>
                        <Form.Label style={{opacity: 0}}> a</Form.Label>
                        <Form.Control inline as="select" onChange={(e) => changeCriteria(1, e.target.value)} value={currentSortAsc}>
                            <option value="asc">T??ng d???n</option>
                            <option value="desc">Gi???m d???n</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Table 
                responsive
                bordered
                striped
                hover
                variant="light"
            >
                <thead>
                    <tr>
                        <th className="text-center">#</th>
                        <th className="text-center">Quiz</th>
                        <th className="text-center">Th???i gian l??m b??i</th>
                        <th className="text-center">??i???m</th>
                        <th className="text-center">S??? c??u ????ng</th>
                        <th className="text-center">D???u th???i gian</th>
                        <th className="text-center">Xem chi ti???t</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        currentShowing.map((record, i) => {
                            return (
                                <tr key={i}>
                                    <td>{record.board_id}</td>
                                    <td>{record.quiz_name}</td>
                                    <td>{formatTime(record.time)}</td>
                                    <td>{record.point}</td>
                                    <td>{record.correct}</td>
                                    <td>{formatDate(new Date(record.date_created))}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="info" 
                                            className="btn-sm text-white"
                                            onClick={() => {viewDetail(record.user_id, record.quiz_id, record.candidate_name)}}
                                        >Chi ti???t</Button>
                                    </td>
                                </tr>
                            )
                        })
                    }                    
                </tbody>
            </Table>
            <div className="d-flex justify-content-between">
                <div>
                    <p>Hi???n th??? k???t qu??? {startEndIndex[0]} - {startEndIndex[1]} tr??n t???ng s??? {recordsContent.length} k???t qu???</p>
                    <Pagination>
                        { 
                            currentPage !== 1 && 
                            <>
                            <Pagination.Item
                                onClick={() => changePage(1)}
                            >{"??"}</Pagination.Item>
                            <Pagination.Item
                                onClick={() => changePage(currentPage - 1)}
                            >{"???"}</Pagination.Item>
                            </>
                        }
                        { 
                            currentPage === 1 && 
                            <>
                            <Pagination.Item disabled>{"??"}</Pagination.Item>
                            <Pagination.Item disabled>{"???"}</Pagination.Item>
                            </>
                        }
                        {
                            pageRange.map((pageNumber) => {
                                let activeClass = pageNumber === currentPage;
                                if (activeClass) {
                                    return (
                                        <Pagination.Item 
                                            key={pageNumber} 
                                            onClick={() => changePage(pageNumber)} 
                                            active 
                                            activeLabel="">{pageNumber}</Pagination.Item>    
                                    )
                                } else {
                                    return (
                                        <Pagination.Item 
                                            key={pageNumber}
                                            onClick={() => changePage(pageNumber)}>{pageNumber}</Pagination.Item>    
                                    )
                                }
                            })
                        }
                        { 
                            currentPage !== pageRange[pageRange.length - 1] && 
                            <>
                            <Pagination.Item
                                onClick={() => changePage(currentPage + 1)}
                            >{"???"}</Pagination.Item>
                            <Pagination.Item
                                onClick={() => changePage(pageRange[pageRange.length - 1])}
                            >{"??"}</Pagination.Item>
                            </>
                        }
                        { 
                            currentPage === pageRange[pageRange.length - 1] && 
                            <>
                            <Pagination.Item disabled>{"???"}</Pagination.Item>
                            <Pagination.Item disabled>{"??"}</Pagination.Item>
                            </>
                        }
                    </Pagination>
                </div>
                <div>
                    <Form.Group>
                        <Form.Label>Hi???n th??? / trang</Form.Label>
                        <Form.Control as="select" onChange={(e) => setCurrentShowPerPage(parseInt(e.target.value))} value={currentShowPerPage}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </Form.Control>
                    </Form.Group>
                </div>
            </div>
            
            </>
            }
            {
                quizReviewReady && 
                <>
                <QuizReview
                    reviewContent={details}
                    questions={questions}
                    quizInfo={quizInfo}
                ></QuizReview>
                <div className="mt-3 text-center mb-3">
                    <Button variant="info" className="text-white" onClick={() => {
                        setQuizReviewReady(false);
                        setDetails([]);
                        setQuestions([]);
                    }}>????ng</Button>
                </div>
                </>
            }
        </Container>
    )
}

export default MyAttempts