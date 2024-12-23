import React, { useRef, useState } from "react";
import styles from "../styles/AddModel.module.css";
import { admin_add } from "../api/Api.jsx";

const AddModel = () => {
  const [questions, setQuestions] = useState([]);
  const modelNameRef = useRef(null);
  const numQuestionsRef = useRef(null);
  const timeRef = useRef(null);
  const [Modeltype, setModeltype] = useState("Free");
  const [paragraph, setParagraph] = useState("");
  const sliderCheckboxRef = useRef(null);

  const addForm = () => {
    const newQuestions = [];
    for (let i = 0; i < parseInt(numQuestionsRef.current.value); i++) {
      newQuestions.push({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
      });
    }
    setQuestions([...questions, ...newQuestions]);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [name]: value };
    setQuestions(newQuestions);
  };

  const handleRadioChange = (e, index, optionNumber) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], answer: optionNumber };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const modelData = {
        model_name: modelNameRef.current.value,
        modelType: modelType,
        numQuestions: questions.length,
        duration: timeRef.current.value,
        questions: questions.map((question) => ({
          question_text: question.question,
          options: [
            question.option1,
            question.option2,
            question.option3,
            question.option4,
          ],
          correct_answer_index: parseInt(question.answer) - 1,
        })),
        paragraph: paragraph, // Add the paragraph to the modelData
      };

      const res = await fetch(admin_add, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify(modelData),
      });

      const parse = await res.json();
    } catch (error) {
      console.log(error);
    }
  };
  const handleSliderChange = () => {
    const isChecked = sliderCheckboxRef.current.checked;
    {
      isChecked ? "Paid" : "Free";
    }
    setModeltype(isChecked);
  };

  return (
    <div>
      <div className={styles.inputfromUser}>
        <input
          type="text"
          className={styles.noOfQuestions}
          placeholder="Question Model Name"
          ref={modelNameRef}
          required
        />
        <input
          type="number"
          className={styles.noOfQuestions}
          placeholder="No of Questions"
          ref={numQuestionsRef}
          required
        />
        <input
          type="text"
          className={styles.noOfQuestions}
          placeholder="Time in minutes"
          ref={timeRef}
          required
        />
        <button type="button" className={styles.send} onClick={addForm}>
          Send
        </button>
        <label className={styles.switch}>
          <input
            type="checkbox"
            ref={sliderCheckboxRef}
            onChange={handleSliderChange}
          />
          <span className={`${styles.slider} ${styles.round}`}></span>
        </label>
        &nbsp; &nbsp;<b className={styles.paid}>Paid</b>
      </div>
      <br />
      <br />
      {/* mapping form */}
      {questions.map((question, index) => (
        <form key={index} className={styles.formtext}>
          <h2 className={styles.qustitle}>Question No {index + 1}</h2>
          <div className={styles.questionmaindiv}>
            <textarea
              type="text"
              name="question"
              className={styles.question}
              placeholder="Enter your question"
              value={question.question}
              required
              onChange={(e) => handleChange(e, index)}
            />
            <br />
            <div>
              {[1, 2, 3, 4].map((optionNumber) => (
                <div key={optionNumber} className={styles.optionContainer}>
                  <input
                    type="text"
                    name={`option${optionNumber}`}
                    placeholder={`Option ${optionNumber}`}
                    className={styles.options}
                    value={question[`option${optionNumber}`]}
                    required
                    onChange={(e) => handleChange(e, index)}
                  />
                  <input
                    type="radio"
                    name={`answer${index}`}
                    value={optionNumber}
                    checked={question.answer === optionNumber}
                    className={styles.buttonRadio}
                    required
                    onChange={(e) => handleRadioChange(e, index, optionNumber)}
                  />
                  {question.answer === optionNumber && (
                    <div className={styles.correctOption}>
                      <span>Correct Option</span>
                    </div>
                  )}
                </div>
              ))}
              <input
                type="hidden"
                name={`correctOption${index}`}
                placeholder="Correct Option No"
                className={styles.optionscorrectNo}
                value={question.answer !== "" ? question.answer : ""}
                readOnly
                required
              />
            </div>
          </div>
          <br />
          {index === 15 && (
            <div>
              <textarea
                type="text"
                name="paragraph"
                className={styles.question}
                placeholder="Enter a paragraph"
                value={paragraph}
                onChange={(e) => setParagraph(e.target.value)}
              />
            </div>
          )}
        </form>
      ))}
      {questions.length > 0 && (
        <div>
          <button
            type="submit"
            className={styles.submit}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddModel;
