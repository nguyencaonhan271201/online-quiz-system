import "./quiz-review.css";
import {React, useState, useEffect, useRef} from 'react'
import {Container, Row, Col} from "react-bootstrap";

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

            </Container>
        </>
    )
}

export default QuizReview
