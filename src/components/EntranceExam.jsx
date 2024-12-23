import React, { useState, useEffect } from "react";
import styles from "../styles/entranceExam.module.css";
import {
  paid_exam, chngEntStat, update_details, entrance_status, send_Result
} from "../api/Api.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";

const Exam = () => {
  const nav = useNavigate();
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
  const [testStarted, setTestStarted] = useState(false);

  // New state variables for form fields
  const [parentsName, setParentsName] = useState("");
  const [parentsOccupation, setParentsOccupation] = useState("");
  const [whyScholarship, setWhyScholarship] = useState("");
  const [interestedCourse, setInterestedCourse] = useState("BBA");
  const [others, setOthers] = useState("");
  const [knowUs, setKnowUs] = useState("");
  const [file, setFile] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    EntranceHandler()
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

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const sendResult = async () => {
    setIsLoading(true);

    const durationInSeconds = 90 * 60 - timeLeft;
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    const data = {
      score: `${totalScore}`,
      model: heading,
      examtype: "entrance",
      duration: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
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
      console.log(error);
      setIsLoading(false);
    }
  };


  const handleSubmit = async () => {
    if (!file) {
      return alert("Please insert your rescent transcript");
    }



    setIsLoading(true);

    try {
      let howyouknowdata = knowUs + " | " + others
      let entdata = new FormData();
      entdata.append("parentsName", parentsName);
      entdata.append("parentsOccupation", parentsOccupation);
      entdata.append("whyScholarship", whyScholarship);
      entdata.append("interestedCourse", interestedCourse);
      entdata.append("knowUs", howyouknowdata);
      entdata.append("image", file);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        return alert("User not authenticated. Please log in.");
      }
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      // Ensure this key matches your backend

      const response = await fetch(update_details, { // Replace with your actual endpoint
        method: "POST",
        body: entdata,
        headers: {
          Authorization: `Bearer ${encodedToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // const { data } = await response.json();
        setIsLoading(false);
        handleClosePopup();
      } else {
        alert(`Failed to upload file. ${data.message || data.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file. Please try again.");
    }
  };


  const imageHandler = (e) => {
    const file = e?.target?.files[0];
    if (!file) {
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const validExtensions = ["jpg", "png", "jpeg"];
    if (!validExtensions.includes(ext)) {
      return alert("Please select a valid image file (jpg, png, jpeg).");
    }

    setFile(file);
  };

  const changeStatus = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(chngEntStat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
      });

      if (res.ok) {
        const updateEntranceToGiven = () => {
          const userInfoString = localStorage.getItem('user');
          if (userInfoString) {
            const user = JSON.parse(userInfoString);
            user.entrance = 'given';
            localStorage.setItem('user', JSON.stringify(user));
          }
        };

        // Update entrance to "given"
        updateEntranceToGiven();


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


  const EntranceHandler = () => {

    const user_role = JSON.parse(localStorage.getItem("user"));
    const fetchData = async () => {

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(entrance_status, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${encodedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.data.examStatus === "enable") {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user.entrance === 'given') {
            alert("You have already given entrance. Please try again after a while!");
            return nav("/student/studentmodel");
          }

        } else if (data.data.examStatus === "disable") {
          // return nav("/student/paidPending");
          alert("Admin has not enabled Entrance");
          return nav("/student/studentmodel");

        } else {
          alert("Admin has not enabled Entrance");
          return nav("/student/studentmodel");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    if (user_role.role === "student") {
      fetchData();
    } else {
      setIsLoading(false);
      return nav("/admin/entranceresult");
    }
  };




  const submitExam = () => {
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
    changeStatus();
    setIsLoading(false);
    setShowPopup(false);
    setTestStarted(true);
  };



  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && testStarted && !isTotal) {
      disqualified()
    }
  };

  useEffect(() => {
    if (testStarted) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [testStarted, isTotal]);


  const disqualified = () => {
    submitExam()
    alert("You have been disqualified for leaving the exam page.");
  };










  const handleSubmitPopup = () => {
    // Ensure the required fields are filled before closing the popup
    if (
      parentsName &&
      parentsOccupation &&
      whyScholarship &&
      interestedCourse &&
      knowUs &&
      file
    ) {
      handleSubmit();
    } else {
      alert("Please fill in all the required fields.");
    }
  };

  // const handleImageChange = (e) => {
  //   const ext = files.name.split(".").pop().toLowerCase();
  //   const validExtensions = ["jpg", "png", "jpeg"];
  //   if (!validExtensions.includes(ext)) {
  //     return alert("Please select a valid image file (jpg, png, jpeg).");
  //   }

  //   setFile(file);

  //   setImages([...e.target.files]);
  // };

  const submissionPopupToggle = () => {
    setSubmissionPopup(false);
  };

  const submissionPopupTrue = () => {
    setSubmissionPopup(true);
  };

  const handleTermsAccept = () => {
    setAcceptedTerms(true);
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
      {showPopup && !acceptedTerms && (
        <div className={styles.confirmationPopup}>
          <h3>Terms & Conditions</h3>
          <p>1) You cannot change tab or leave the exam page</p>
          <p>2) You will be automatically disqualified if you change tab, reload the page, or press back after clicking on the start button</p>
          <p>3) The test duration is 90 minutes.</p>
          <p>4) You must submit your answer sheet before the timer ends.</p>
          <p>5) The answer sheet will be automatically submitted if the timer ends before you submit.</p>
          <p>6) If you mistakenly reload the page or go back from the test page during the exam, the changes may not be saved.</p>
          <p>7) In case of any technical difficulties during the test, contact the exam administrator immediately.</p>
          <button onClick={handleTermsAccept}>Accept Terms and Conditions</button>
        </div>
      )}
      {showPopup && acceptedTerms && (
        <div className={styles.confirmationPopup}>
          <p className={styles.disclaimer}>*You will be automatically disqualified if you change tab, reload the page, or pressed back after clicking on the start button</p>

          <div className={styles.formGroup}>
            <label htmlFor="parentsName">Parent's Name</label>
            <input
              type="text"
              id="parentsName"
              value={parentsName}
              onChange={(e) => setParentsName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="parentsOccupation">Parent's Occupation</label>
            <input
              type="text"
              id="parentsOccupation"
              value={parentsOccupation}
              onChange={(e) => setParentsOccupation(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="whyScholarship">Why do you need Scholarship?</label>
            <textarea
              id="whyScholarship"
              value={whyScholarship}
              onChange={(e) => setWhyScholarship(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="interestedCourse">Interested Course:</label>
            <select id="interestedCourse" name="interestedCourse" onChange={(e) => setInterestedCourse(e.target.value)}
            >
              <option value="BBA">BBA</option>
              <option value="BCSIT">BCSIT</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="knowUs">How Did You Know About Us?</label>
            <select id="knowUs" name="knowUs" onChange={(e) => setKnowUs(e.target.value)}
            >
              <option value="Search Engine">Search Engine</option>
              <option value="Social Media">Social Media</option>
              <option value="Online Advertisement">Online Advertisement</option>
              <option value="Friends, family and relatives">Friends, family and relatives</option>
              <option value="Educational Institution">Educational Institution</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Webinars/Seminars">Webinars/Seminars</option>
              <option value="Blog or Article">Blog or Article</option>
              <option value="Forums/Discussion Boards">Forums/Discussion Boards</option>
              <option value="Printed Media">Printed Media</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {knowUs === 'Other' && (
            <div className={styles.formGroup}>
              <label htmlFor="others">Others</label>
              <input
                id="others"
                value={others}
                onChange={(e) => setOthers(e.target.value)}
              />
            </div>
          )}

          {knowUs === 'Friends, family and relatives' && (
            <div className={styles.formGroup}>
              <label htmlFor="others">Friend's Name</label>
              <input
                id="others"
                value={others}
                onChange={(e) => setOthers(e.target.value)}
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="images">Upload your recent Transcript</label>
            <input
              type="file"
              id="images"
              multiple
              onChange={imageHandler}
            />
          </div>
          <button onClick={handleSubmitPopup}>Start Test</button>
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
      <div className={styles.heading}>Entrance Exam</div>

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
        <button
          onClick={submissionPopupTrue}
          className={styles.submitButton}
          disabled={isDisabled}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Exam;
