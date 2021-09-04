import "./quiz-attempts.css";
import {React, useState, useEffect, useContext} from 'react'
import axios from "axios";
import {AuthContext} from "../../context/AuthContext";
import {Row, Col, Container, Button, Form, Table, Pagination} from "react-bootstrap";
import QuizReview from "./../../components/quiz-review/QuizReview";
  
function QuizAttempts(props) {
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
                criteriaString = "candidate_name";
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
            time = `${hours} giờ`;
            if (minutes > 0)
                time += ` ${minutes} phút`;
            if (seconds > 0)
                time += ` ${seconds} giây`;
        } else if (timeInSeconds >= 60) {
            let minutes = parseInt(timeInSeconds / 60);
            let seconds = timeInSeconds - 60 * minutes;
            time = `${minutes} phút`;
            if (seconds > 0)
                time += ` ${seconds} giây`;
        } else {
            time = (timeInSeconds).toString() + " giây";
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
        await axios.get(`https://online-quiz-system-server.herokuapp.com/api/quiz/info/${props.location.state.id}`)
        .then(async(res) => {
            let thisQuizInfo = res.data;
            setQuizInfo(thisQuizInfo[0]);
    
            await axios.post(`https://online-quiz-system-server.herokuapp.com/api/quiz/get_attempts`, {
                quiz_id: props.location.state.id,
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
        })
        .catch(err => {
            console.log(err);
        });
       
        
    }

    const viewDetail = async(user, quiz, name) => {
        await axios.post("https://online-quiz-system-server.herokuapp.com/api/quiz/attempt_detail", {
            user_id: user,
            quiz_id: quiz
        })
        .then(res => {
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
        })
        .catch(err => {

        })
    }

    const changeCriteria = (mode, value) => {
        if (mode === 0) {
            let getTmpData = recordsContent;
            getTmpData = sortRecord(getTmpData, parseInt(value), currentSortAsc === "asc");
            setRecordsContent(getTmpData);
            let getSubArray = getTmpData;
            getSubArray = getTmpData.slice(0, Math.min(currentShowPerPage, getTmpData.length));
            setCurrentShowing(getSubArray);
            setCurrentCriteria(value);
        } else {
            let getTmpData = recordsContent;
            getTmpData = sortRecord(getTmpData, parseInt(currentCriteria), value === "asc");
            setRecordsContent(getTmpData);
            let getSubArray = getTmpData;
            getSubArray = getTmpData.slice(0, Math.min(currentShowPerPage, getTmpData.length));
            setCurrentShowing(getSubArray);
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
        if (details.length !== 0 && questions.length !== 0 && details.length === questions.length) {
            setQuizReviewReady(true);
        }
    }, [details, questions])

    return (
        <Container className="mt-3 mb-3">
            {!quizReviewReady && quizInfo.length !== 0 &&
            <>
            <h1 className="text-center">{quizInfo.quiz_title}</h1>
            <h3 className="text-center">Tạo bởi: {quizInfo.creator}</h3>
            <h5 className="text-center">Bảng kết quả</h5>
            <Row className="mb-2">
                <Col lg={3} md={6} sm={12}>
                    <Form.Group>
                        <Form.Label>Sắp xếp theo</Form.Label>
                        <Form.Control inline as="select" onChange={(e) => changeCriteria(0, e.target.value)} value={currentCriteria}>
                            <option value="0">#</option>
                            <option value="1">Tên</option>
                            <option value="2">Thời gian làm bài</option>
                            <option value="3">Điểm</option>
                            <option value="4">Số câu đúng</option>
                            <option value="5">Dấu thời gian</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg={3} md={6} sm={12}>
                    <Form.Group>
                        <Form.Label style={{opacity: 0}}> a</Form.Label>
                        <Form.Control inline as="select" onChange={(e) => changeCriteria(1, e.target.value)} value={currentSortAsc}>
                            <option value="asc">Tăng dần</option>
                            <option value="desc">Giảm dần</option>
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
                        <th className="text-center">Tên</th>
                        <th className="text-center">Thời gian làm bài</th>
                        <th className="text-center">Điểm</th>
                        <th className="text-center">Số câu đúng</th>
                        <th className="text-center">Dấu thời gian</th>
                        <th className="text-center">Xem chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        currentShowing.map((record, i) => {
                            return (
                                <tr key={i}>
                                    <td>{record.board_id}</td>
                                    <td>{record.candidate_name}</td>
                                    <td>{formatTime(record.time)}</td>
                                    <td>{record.point}</td>
                                    <td>{record.correct}</td>
                                    <td>{formatDate(new Date(record.date_created))}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="info" 
                                            className="btn-sm text-white"
                                            onClick={() => {viewDetail(record.user_id, props.location.state.id, record.candidate_name)}}
                                        >Chi tiết</Button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    {/* <tr>
                    <td>1</td>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <td key={index}>Table cell {index}</td>
                    ))}
                    </tr> */}
                    
                </tbody>
            </Table>
            <div className="d-flex justify-content-between">
                <div>
                    <p>Hiển thị kết quả {startEndIndex[0]} - {startEndIndex[1]} trên tổng số {recordsContent.length} kết quả</p>
                    <Pagination>
                        { 
                            currentPage !== 1 && 
                            <>
                            <Pagination.Item
                                onClick={() => changePage(1)}
                            >{"«"}</Pagination.Item>
                            <Pagination.Item
                                onClick={() => changePage(currentPage - 1)}
                            >{"‹"}</Pagination.Item>
                            </>
                        }
                        { 
                            currentPage === 1 && 
                            <>
                            <Pagination.Item disabled>{"«"}</Pagination.Item>
                            <Pagination.Item disabled>{"‹"}</Pagination.Item>
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
                            >{"›"}</Pagination.Item>
                            <Pagination.Item
                                onClick={() => changePage(pageRange[pageRange.length - 1])}
                            >{"»"}</Pagination.Item>
                            </>
                        }
                        { 
                            currentPage === pageRange[pageRange.length - 1] && 
                            <>
                            <Pagination.Item disabled>{"›"}</Pagination.Item>
                            <Pagination.Item disabled>{"»"}</Pagination.Item>
                            </>
                        }
                    </Pagination>
                </div>
                <div>
                    <Form.Group>
                        <Form.Label>Hiển thị / trang</Form.Label>
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
                    name={selectionName}
                ></QuizReview>
                <div className="mt-3 text-center mb-3">
                    <Button variant="success" className="btn-rounded text-white" onClick={() => {
                        setQuizReviewReady(false);
                        setDetails([]);
                        setQuestions([]);
                        setSelectionName("");
                    }}>Đóng</Button>
                </div>
                </>
            }
        </Container>
    )
}

export default QuizAttempts
