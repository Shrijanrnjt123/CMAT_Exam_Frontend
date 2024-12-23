import React, { useState, useEffect } from "react";
import { CircularProgress } from "@material-ui/core";
import { FaUser } from "react-icons/fa";
import styles from "../styles/Result.module.css";
import { useNavigate } from "react-router-dom";
import { get_Result } from "../api/Api.jsx";

const Result = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortByScore, setSortByScore] = useState("none");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(get_Result, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${encodedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        let { data } = await response.json();

        // Filtering by start and end date
        if (startDate && endDate) {
          data = data.filter(
            (item) =>
              new Date(item.createdAt) >= new Date(startDate) &&
              new Date(item.createdAt) <= new Date(endDate)
          );
        }

        // Sorting by score
        if (sortByScore === "highest") {
          data = data.sort((a, b) => b.score - a.score);
        } else if (sortByScore === "lowest") {
          data = data.sort((a, b) => a.score - b.score);
        }

        setUserData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false); // Set isLoading to false
      }
    };

    fetchData();

    const handleBackButton = (event) => {
      event.preventDefault();
      if (user.role === "admin") {
        navigate("/admin/AdminDashboard");
      } else if (user.role === "student") {
        navigate("/student/studentmodel");
      }
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };

  }, [startDate, endDate, sortByScore, navigate]);

  // Function to toggle accordion
  const toggleAccordion = (index) => {
    setUserData(
      userData.map((user, i) => {
        if (index === i) {
          return { ...user, isOpen: !user.isOpen };
        } else {
          return { ...user, isOpen: false }; // Close other accordions
        }
      })
    );
  };

  // Function to handle start date change
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  // Function to handle end date change
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  // Function to handle score sorting
  const handleScoreSortChange = (event) => {
    setSortByScore(event.target.value);
  };

  return (
    <div className={styles.modelContainer}>
      {isLoading ? (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      ) : (
        <div className={styles.userContainer}>
          <center>
            <h1>Results</h1>
          </center>
          {/* Filter Controls */}
          <div className={styles.filterControls}>
            <div className={styles.dateFilter}>
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
              />
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
            <div className={styles.scoreFilter}>
              <label htmlFor="sortByScore">Sort by Score:</label>
              <select
                id="sortByScore"
                value={sortByScore}
                onChange={handleScoreSortChange}
              >
                <option value="none">None</option>
                <option value="highest">Highest to Lowest</option>
                <option value="lowest">Lowest to Highest</option>
              </select>
            </div>
          </div>
          {userData.length === 0 ? (
            <p className={styles.noRequestsMessage}>No Results found</p>
          ) : (
            userData.map((user, index) => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userIcon}>
                  <FaUser />
                </div>
                <div className={styles.userDetails}>
                  <div
                    className={styles.userHeader}
                    onClick={() => toggleAccordion(index)}
                  >
                    <h3>{user.name}</h3>
                    <p>
                      Exam Date: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Score:</strong> {user.score} / 100
                    </p>
                  </div>
                  {user.isOpen && (
                    <div className={styles.userInfo}>
                      <div>
                        <p>
                          <strong>Exam Type:</strong> {user.examtype}
                        </p>
                        <p>
                          <strong>User ID:</strong> {user.userid}
                        </p>
                        <p>
                          <strong>Exam Duration:</strong> {user.duration}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Result;
