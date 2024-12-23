import React, { useState, useEffect } from "react";
import styles from "../styles/StudentModel.module.css";
import { question_view } from "../api/Api.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";

const StudentModel = () => {
  const [studentModels, setStudentModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = (id) => {
    localStorage.setItem("id", JSON.stringify(id));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(question_view, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${encodedToken}`,
          },
        });

        if (!response.ok) {
          setIsLoading(false);
          throw new Error("Network response was not ok");
        }

        const { data } = await response.json();
        setIsLoading(false);

        const updatedStudentModels = data.map((item) => ({
          name: item.model_name,
          id: item._id,
        }));

        setStudentModels(updatedStudentModels);
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false);
        navigate("/error");
      }
    };

    fetchData();

    // Disable back button
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/");
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  return (
    <div className={styles.studentModelContainer}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      {studentModels.map((model) => (
        <div key={model.id} className={styles.accordion}>
          <NavLink
            to={`/all/exam/${model.id}`}
            className={styles.navLinkExam}
            onClick={() => handleClick(model.id)}
          >
            <div className={styles.accordionHeader}>
              <h3>{model.name}</h3>
              <button className={styles.arrowButton}>&#x25B6;</button>
            </div>
          </NavLink>
        </div>
      ))}
    </div>
  );
};

export default StudentModel;
