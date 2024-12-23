import React, { useState, useEffect } from "react";
import styles from "../styles/Exam.module.css";
import { paid_exam, change_status, send_Result } from "../api/Api.jsx";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";

const Exam = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [heading, setHeading] = useState("");
  const [bgstate, setBgState] = useState([]);
  const [isTotal, setIsTotal] = useState(false);
  const [showParagraph, setShowParagraph] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionPopup, setSubmissionPopup] = useState(false);
  const location = useLocation();
  const { iddata } = location.state;
  let totalScore = 0;
  const showLine = [
    "Direction: In the following questions, choose the word which best expresses the meaning of the capitalized word.",
    "Directions: Select the word which is closest to the opposite in meaning of the word in capital letters.",
    "Directions: Select the proper proposition to fill in the blanks in the following questions:",
    "Directions: In the questions given below out of four alternatives, choose the one which can be substituted for the given word/sentence.",
    "Direction: The passage given below is followed by questions based on its contents. After reading the passage, choose the best answer to each question.",
    "Direction: Find the best answer for the questions given below.",
    "Direction: In the questions 37 to 40, find the odd one out.",
    "Direction: Select the pair of words which best expresses the relationship similar to that expressed in the pair in bold letters.",
    "Direction: Choose the word which is least like other words in a group.",
    "Direction: For each question, find the best answer",
    "Direction: In each of the following question, select the best answer choice.",
    "Direction: For each of the questions below, select the best of the answer choices given.",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      submitExam();
    } else if (!showPopup && !isDisabled) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft, showPopup, isDisabled]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const response = await fetch(paid_exam, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { data } = await response.json();
      const requiredModel = data;
      setQuestions(requiredModel.questions);
      setTimeLeft(requiredModel.duration * 60);
      setHeading(requiredModel.model_name);
      setShowParagraph(requiredModel.paragraph);

      changeStatus()
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };


  const sendResult = async () => {
    setIsLoading(true);

    const durationInSeconds = (90 * 60) - timeLeft;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    const data = {
      score: `${totalScore}`,
      model: heading,
      examtype: "paid",
      duration: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    };
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(send_Result, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsLoading(false);

      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const changeStatus = async () => {
    setIsLoading(true);

    const data = {
      requestId: iddata._id,
      status: "given",
    };
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(change_status, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {

      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };



  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (selectedOptions[questionIndex] === undefined) {
      setAttempt(attempt + 1);
    }

    setSelectedOptions({
      ...selectedOptions,
      [questionIndex]: optionIndex,
    });
  };

  const submitExam = () => {
    const newScores = [...bgstate];
    questions.forEach((question, index) => {
      const selectedOptionIndex = selectedOptions[index];
      if (
        selectedOptionIndex !== undefined &&
        selectedOptionIndex === question.correct_answer_index
      ) {
        totalScore++;
        bgstate[index] = "correctAnswer";
      } else {
        bgstate[index] = "incorrectAnswer";
      }
    });
    setSubmissionPopup(false);
    setScore(totalScore);
    setIsDisabled(true);
    sendResult();
    setIsTotal(true);
  };

  const handleClosePopup = () => {
    setIsLoading(false);
    setShowPopup(false);
  };

  const submissionPopupToggle = () => {
    setSubmissionPopup(false);
  };

  const submissionPopupTrue = () => {
    setSubmissionPopup(true);
  };

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      {showPopup && (
        <div className={styles.confirmationPopup}>
          <p>Accepts the terms and start to continue.</p>
          <ul>
            <li>This is a timed test of 2 hours.</li>
            <li>You must submit your answer sheet before the timer ends.</li>
            <li>
              The answer sheet will be automatically submitted in case your
              timer ends.
            </li>
            <li>
              If you mistakenly reload the page or go back from the page during
              the test, the changes may not be saved and your result will not be
              published.
            </li>
          </ul>
          <button onClick={handleClosePopup}>Start Test</button>
        </div>
      )}
      {submissionPopup && (
        <div className={styles.confirmationPopup}>
          <p>Are you sure you want to submit?</p>
          <br />
          <button onClick={submitExam}>Submit</button>
          <button onClick={submissionPopupToggle}>Cancel</button>
        </div>
      )}
      <div className={styles.heading}>Paid Exam</div>

      <div className={styles.questionCard}>
        {questions.map((question, questionIndex) => (
          <React.Fragment key={question._id}>
            {showLine && questionIndex === 0 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[0]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 4 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[1]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 8 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[2]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 12 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[3]}</p>
              </React.Fragment>
            )}
            {showParagraph && questionIndex === 16 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[4]}</p>
                <br />
                <p className={styles.paragraph}>{showParagraph}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 20 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[5]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 36 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[6]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 40 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[7]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 48 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[8]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 55 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[9]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 60 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[10]}</p>
              </React.Fragment>
            )}
            {showLine && questionIndex === 80 && (
              <React.Fragment>
                <br />
                <p className={styles.line}>{showLine[11]}</p>
              </React.Fragment>
            )}
            <div
              className={`${styles.questionBox} ${bgstate[questionIndex] === "correctAnswer"
                ? styles.correctAnswer
                : bgstate[questionIndex] === "incorrectAnswer"
                  ? styles.incorrectAnswer
                  : ""
                }`}
            >
              <h3>{`${questionIndex + 1}) ${question.question_text}`}</h3>
              <div className={styles.options}>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className={styles.option}>
                    <input
                      type="radio"
                      id={`question${questionIndex}_option${optionIndex}`}
                      name={`options${questionIndex}`}
                      value={option}
                      checked={selectedOptions[questionIndex] === optionIndex}
                      onChange={() =>
                        handleOptionSelect(questionIndex, optionIndex)
                      }
                      disabled={isDisabled} // Disable radio button if isDisabled is true
                    />
                    <label htmlFor={`question${questionIndex}_option${optionIndex}`}>{option}</label>
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className={styles.timerSubmit}>
        <div className={styles.timer}>
          <h1 className={styles.timeHeading}>Time left</h1>
          {Math.floor(timeLeft / 3600)
            .toString()
            .padStart(2, "0")}
          :
          {Math.floor((timeLeft % 3600) / 60)
            .toString()
            .padStart(2, "0")}
          :{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <br />
        <center>
          <div className={styles.attempt}>
            Attempted Question: {attempt}/{questions.length}
          </div>
          {isTotal && (
            <div className={styles.attempt}>
              Total Score: {score}/{questions.length}
            </div>
          )}
        </center>
        <br />
        <br />
        <button onClick={submissionPopupTrue} className={styles.submitButton} disabled={isDisabled}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Exam;

