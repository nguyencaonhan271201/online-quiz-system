import "./question-add-modal.css";
import {React, useState, useEffect, useRef} from 'react'
import {Form, Button, Modal, Row, Col} from "react-bootstrap";
import {Cancel, PermMedia} from "@material-ui/icons"
import {Chip, Paper} from '@material-ui/core';
import storage from './../../firebase';

function QuestionAddModal(props) {
    const [question, setQuestion] = useState("");
    const [questionType, setQuestionType] = useState(0);
    const [numberOfChoices, setNumberOfChoices] = useState(0);
    const [numberOfChoicesError, setNumberOfChoicesError] = useState("");
    const [keys, setKeys] = useState([]);
    const [keyCorrects, setKeyCorrects] = useState([]);
    const [keyImages, setKeyImages] = useState([]);
    const [keyType1Choices, setKeyType1Choices] = useState([]);
    const [type1CurrentInput, setType1CurrentInput] = useState("");
    const [explain, setExplain] = useState("");
    const [file, setFile] = useState(null);
    const [time, setTime] = useState("");
    const [point, setPoint] = useState("");
    const [validateError, setValidateError] = useState("");
    const keyImageURLs = useRef();
    const imageURL = useRef();

    useEffect(() => {
        keyImageURLs.current = [];
        imageURL.current = "";
    }, []);

    const check = () => {
        //Count target
        let getCount = 0;
        for (let i = 0; i < keyImages.length; i++) {
            if (keyImages[i])
                getCount++;
        }
        if (file)
            getCount++;

        let count = 0;
        if (imageURL.current !== "" && file)
        {
            count++;
        }
        for (let i = 0; i < keyImageURLs.current.length; i++) {
            if (keyImageURLs.current[i] !== "")
            {
                count++;
            }
        }

        if (count === getCount && getCount > 0) {
            callParentSubmit();
        }
    }

    const handleQuestionTypeChange = (type) => {
        setQuestionType(type);
        setKeyType1Choices([]);
        setType1CurrentInput("");
        if (type === 1) 
        {
            setNumberOfChoices(1);
            setNumberOfChoicesError("");
            setKeyCorrects([true]);
            setKeys([""]);
            setKeyImages([""]);
            keyImageURLs.current = [""];
        } else {
            setNumberOfChoices(0);
            setKeyCorrects([]);
            setKeys([]);
            setKeyImages([]);
            keyImageURLs.current = [];
        }
    }

    const handleChoicesCountChange = (count) => {
        if (count < 2 || count > 5) {
            setNumberOfChoicesError("Số lượng phương án phải từ 2 đến 5.");
        } else {
            setNumberOfChoices(count);
            setNumberOfChoicesError("");
            let tmpKeysArr = []
            let tmpKeysCorrectArr = [] 
            let tmpKeyImages = [];
            let tmpKeyImagesURLs = [];
            for (let i = 0; i < count; i++) {
                tmpKeysArr.push("");
                tmpKeysCorrectArr.push(false);
                tmpKeyImages.push(null);
                tmpKeyImagesURLs.push("");
            }
            setKeyCorrects(tmpKeysCorrectArr);
            setKeys(tmpKeysArr);
            setKeyImages(tmpKeyImages);
            keyImageURLs.current = tmpKeyImagesURLs;
        }
    }

    const handleCorrectKeyChange = (index) => {
        let getKeyCorrectArr = [];
        for (let i = 0; i < keyCorrects.length; i++) {
            getKeyCorrectArr.push(false);
        }
        let item = getKeyCorrectArr[index];
        getKeyCorrectArr[index] = !item;
        setKeyCorrects(getKeyCorrectArr);
    }

    const handleKeyChange = (index, value) => {
        let emptyArr = [];
        for (let i = 0; i < keys.length; i++) {
            if (i === index) {
                emptyArr.push(value);
            } else {
                emptyArr.push(keys[i]);
            }
        }
        setKeys(emptyArr);
        setType1CurrentInput(value);
    }

    const handleKeyImage = (index, file) => {
        let emptyArr = [];
        for (let i = 0; i < keyImages.length; i++) {
            if (i === index) {
                emptyArr.push(file);
            } else {
                emptyArr.push(keyImages[i]);
            }
        }
        setKeyImages(emptyArr);
    }

    const setImageNull = (i) => {
        let emptyArr = [...keyImages];
        emptyArr[i] = null;
        setKeyImages(emptyArr);
    }

    const prepareFormSubmit = async(e) => {
        e.preventDefault();

        //Validate info
        if (question === "") {
            setValidateError("Vui lòng nhập nội dung câu hỏi.");
            return;
        } 
        
        if (questionType === 0) {
            if (!keyCorrects.includes(true)) {
                setValidateError("Vui lòng chọn 1 đáp án đúng.");
                return;
            }
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] === "" && !keyImages[i]) {
                    setValidateError("Phương án không hợp lệ.");
                    return;
                }
            }
        } else if (questionType === 1) {
            if (keyType1Choices.length === 0) {
                setValidateError("Vui lòng nhập ít nhất 1 đáp án cho câu hỏi.");
                return;
            }
        }
        
        if (!props.useQuizTime && isNaN(parseInt(time))) {
            setValidateError("Thời gian trả lời không hợp lệ.");
            return;
        } else if (isNaN(parseInt(point))) {
            setValidateError("Điểm số câu không hợp lệ.");
            return;
        }

        let getCount = 0;
        for (let i = 0; i < keyImages.length; i++) {
            if (keyImages[i])
                getCount++;
        }
        if (file)
            getCount++;

        //Upload to firebase and retrieve URL 
        if (getCount !== 0) {
            if (file) {
                let fileName = file.name + "-" + Date.now();
                //questions_images
                storage.ref(`questions_images/${fileName}`).put(file)
                .on("state_changed", (snapshot) => {}, 
                (error) => {console.log(error)}, 
                () => {
                    storage.ref(`questions_images/`).child(`${fileName}`).getDownloadURL()
                    .then(
                        (url) => {
                            imageURL.current = url;
                            check();
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                });
            }

            for (let i = 0; i < keyImages.length; i++) {
                if (keyImages[i]) {
                    let keyFileName = keyImages[i].name + "-" + Date.now();
                    //questions_images
                    storage.ref(`questions_images/${keyFileName}`).put(keyImages[i])
                    .on("state_changed", (snapshot) => {}, 
                    (error) => {console.log(error)}, 
                    () => {
                        storage.ref(`questions_images/`).child(`${keyFileName}`).getDownloadURL()
                        .then(
                            (url) => {
                                setImageURL(i, url);  
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                    });
                }
            }
        } else {
            callParentSubmit();
        }
    }

    const setImageURL = (index, path) => {
        // let arrays = [...keyImagesURLs];
        // arrays[index] = path;
        // setKeyImagesURLs(arrays);

        let getArray = keyImageURLs.current;
        getArray[index] = path;
        keyImageURLs.current = getArray;
        check();
    }

    const callParentSubmit = () => {
        let output = {};
        output["question"] = question;
        output["questionType"] = questionType;
        output["numberOfChoices"] = numberOfChoices;
        output["keyCorrects"] = keyCorrects;
        output["explain"] = explain;
        output["time"] = time === ""? 0 : parseInt(time);
        output["point"] = point;
        output["image"] = imageURL.current;
        output["keyImages"] = keyImageURLs.current;

        if (questionType === 0) {
            output["keys"] = keys;
        } else {
            output["keys"] = [""];
            
            for (let i = 0; i < keyType1Choices.length - 1; i++) {
                output["keys"][0] += keyType1Choices[i] + "~>";
            }
            output["keys"][0] += keyType1Choices[keyType1Choices.length - 1];
        }

        //Refresh
        setValidateError("");
        setQuestion("");
        setQuestionType(0);
        setNumberOfChoicesError("");
        setNumberOfChoices(0);
        setKeys([]);
        setKeyCorrects([]);
        setExplain("");
        setFile(null);
        setTime("");
        setPoint("");
        keyImageURLs.current = [];
        imageURL.current = "";
        setKeyImages([]);
        setKeyType1Choices([]);
        setType1CurrentInput("");

        props.onAddQuestionSubmit(output);
    }

    const keyBoxKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setKeyType1Choices([...keyType1Choices, e.target.value]);
            setType1CurrentInput("");
        }
    }

    const deleteKeyType1Choice = (index) => {
        let cloneArray = [...keyType1Choices];
        cloneArray.splice(index, 1);
        setKeyType1Choices(cloneArray);
    }

    return (
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            {...props}
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Thêm câu hỏi (câu {props.numberOfQuest + 1})
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Row>
                    <Col md={10} sm={12} className="offset-md-1 offset-sm-0">
                        <Form id="questionAddForm" onSubmit={prepareFormSubmit}>
                            <Form.Group className="">
                                <Form.Label>Câu hỏi</Form.Label>
                                <Form.Control as="textarea" required validate="Quiz name is not valid!"
                                onChange={(e) => setQuestion(e.target.value)}/>
                            </Form.Group>
                            <Form.Group className="">
                            <fieldset>
                                <Form.Group as={Row} className="mb-3">
                                <Form.Label as="legend" column sm={2}>
                                    Loại:
                                </Form.Label>
                                <Col sm={12}>
                                    <Form.Check
                                        type="radio"
                                        label="Trắc nghiệm"
                                        name="question-type"
                                        checked={questionType === 0}
                                        onChange={() => handleQuestionTypeChange(0)}
                                    />
                                     <Form.Check
                                        type="radio"
                                        label="Trả lời ngắn"
                                        name="question-type"
                                        checked={questionType === 1}
                                        onChange={() => handleQuestionTypeChange(1)}
                                    />
                                </Col>
                                </Form.Group>
                            </fieldset>
                            </Form.Group>
                            {questionType === 0 && 
                                (<Form.Group className="">
                                <Form.Label>Số phương án</Form.Label>
                                <Form.Control 
                                    type="number"
                                    validate="Phải là giá trị từ 2 đến 5" 
                                    min={2} max={5}
                                    onChange={(e) => handleChoicesCountChange(e.target.value)}
                                />
                                <p className="error">{numberOfChoicesError}</p>
                                </Form.Group>)
                            }
                            {
                                numberOfChoicesError === "" && (questionType === 0 && [...Array(parseInt(numberOfChoices))].map((x, i) => {
                                    let getClassName = `question-${numberOfChoices}-answer`;
                                    let idImageName = `file-${i}`
                                    return (
                                        <Form.Group className="mt-2">
                                            <Form.Label>Phương án {i + 1}
                                            <Form.Check
                                                type="radio"
                                                label="Đúng"
                                                name={getClassName}
                                                onChange={() => handleCorrectKeyChange(i)}
                                            />
                                            </Form.Label>
                                            <Form.Control type="text" validate="Không hợp lệ!" minLength={1}
                                            onChange={(e) => handleKeyChange(i, e.target.value)}/>
                                            <Form.Group className="mb-3 mt-3">
                                                <Form.Label>Ảnh phương án (nếu có)</Form.Label><br></br>
                                                <label htmlFor={idImageName} className="shareOption" style={{cursor: "pointer"}}>
                                                    <PermMedia htmlColor="green" className="shareIcon"/>
                                                    <Form.Control style={{display: "none"}} type="file" id={idImageName} accept=".png, .jpeg, .jpg" size="sm" onChange={(e) => handleKeyImage(i, e.target.files[0])}/>
                                                </label>
                                            </Form.Group>
                                            {keyImages[i] && <div className="keyImgContainer">
                                                <img className="shareImg" src={URL.createObjectURL(keyImages[i])} alt=""/>
                                                <Cancel className="shareCancelImg" onClick={() => setImageNull(i)}></Cancel>
                                            </div>}
                                        </Form.Group>
                                    )
                                })) || 
                                (questionType === 1 && 
                                    <>
                                    <Form.Group className="">
                                        <Form.Label>Đáp án</Form.Label>
                                        <Form.Control type="text" validate="Đáp án không hợp lệ!" minLength={1}
                                        value={type1CurrentInput}
                                        onChange={(e) => handleKeyChange(0, e.target.value)}
                                        onKeyPress={(e) => keyBoxKeyDown(e)}/>
                                    </Form.Group>
                                    {keyType1Choices.length > 0 && 
                                    <Paper component="ul">
                                        {keyType1Choices.map((choice, index) => {
                                            return (
                                                <li key={index}>
                                                    <Chip
                                                        label={choice}
                                                        onDelete={() => deleteKeyType1Choice(index)}
                                                    />
                                                </li>
                                            )
                                        })}
                                    </Paper>
                                    }
                                    </>
                                )
                            }
                            <Form.Group className="mt-2">
                                <Form.Label>Giải thích (nếu có)</Form.Label>
                                <Form.Control as="textarea" validate="Không hợp lệ!"
                                onChange={(e) => setExplain(e.target.value)}/>
                            </Form.Group>
                            <Form.Group className="mt-2">
                                <Form.Label>Điểm số</Form.Label>
                                <Form.Control type="number" min={0} validate="Không hợp lệ!"
                                onChange={(e) => setPoint(e.target.value)}/>
                            </Form.Group>
                            {!props.useQuizTime && <Form.Group className="mb-3 mt-3">
                                <Form.Label>Thời gian trả lời (giây): </Form.Label><br></br>
                                <Form.Control 
                                    type="number"
                                    min = {1}
                                    onChange={(e) => setTime(e.target.value)} 
                                />
                            </Form.Group>}
                            <Form.Group className="mb-3 mt-3">
                                <Form.Label>Ảnh câu hỏi (nếu có)</Form.Label><br></br>
                                <label htmlFor="file" className="shareOption" style={{cursor: "pointer"}}>
                                    <PermMedia htmlColor="green" className="shareIcon"/>
                                    <Form.Control style={{display: "none"}} type="file" id="file" accept=".png, .jpeg, .jpg" size="sm" onChange={(e) => setFile(e.target.files[0])}/>
                                </label>

                            </Form.Group>
                            </Form>
                            {file && <div className="shareImgContainer">
                                <img className="shareImg" src={URL.createObjectURL(file)} alt=""/>
                                <Cancel className="shareCancelImg" onClick={() => setFile(null)}></Cancel>
                            </div>}
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
            <p className="error">{validateError}</p>
            <Button variant="success" type="submit" form="questionAddForm">Thêm</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default QuestionAddModal