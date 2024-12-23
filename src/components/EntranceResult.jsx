import React, { useState, useEffect } from "react";
import { CircularProgress } from "@material-ui/core";
import { FaUser } from "react-icons/fa";
import styles from "../styles/Result.module.css";
import { useNavigate } from "react-router-dom";
import { entrance_result, entrance_status, entranceToggle, chngEntStat } from "../api/Api.jsx";

const Result = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortByScore, setSortByScore] = useState("none");
  const [entranceExamStatus, setentranceExamStatus] = useState("");
  const navigate = useNavigate();
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(entrance_result, {
          method: "GET",
          headers: {
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
      }
    };

    const entstats = async () => {

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
          setIsLoading(false);
          throw new Error("Network response was not ok");
        }
        setIsLoading(false);
        const data = await response.json();
        if (data.data.examStatus === "enable") {
          setentranceExamStatus("enable")
        } else {
          setentranceExamStatus("disable")
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false);
      }
    };


    fetchData();
    entstats();
  }, [navigate, startDate, endDate, sortByScore]);


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
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const viewfullimage = (imagePath) => {
    setFullScreenImage(imagePath);
  };

  const handleCloseModal = () => {
    setFullScreenImage(null);
  };

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


  const changeEntStat = async () => {
    setIsLoading(true);
    const data = {
      setentrance: entranceExamStatus,
    };
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(entranceToggle, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        if (entranceExamStatus === 'enable') {
          changeStatus();
        }
        setIsLoading(false);

      } else {
        setIsLoading(false);

        alert("Something went wrong!")
      }
    } catch (error) {
      console.log(error)
      setIsLoading(false);
    }
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
            <h1>Entrance Results</h1>
            <br />
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
              <div className={styles.scoreFilter}>
                <label htmlFor="examStatus">Entrance: </label>
                <select
                  id="examStatus"
                  name="examStatus"
                  value={entranceExamStatus}
                  onChange={(e) => setentranceExamStatus(e.target.value)}
                >
                  <option value="enable">Enabled</option>
                  <option value="disable">Disabled</option>
                </select>
                <button onClick={changeEntStat} className={styles.containerButton}>
                  Save
                </button>
              </div>

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
            <p className={styles.noRequestsMessage}>No results found</p>
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
                        <p>
                          <strong>Transcript:</strong>
                        </p>

                        {/* const imagePath = request.images.replace("/home/nepatron/", "https://"); */}
                        <img
                          src={user.entranceDetails[0].images.replace("/home/nepatron/", "https://")}
                          onError={(e) => {
                            console.error(`Error loading image: ${user.entranceDetails[0].images.replace("/home/nepatron/", "https://")}`);
                            e.target.src = "https://via.placeholder.com/150"; // Fallback image
                          }}
                          className={styles.img}
                          alt="Selected Image"
                          onClick={() => viewfullimage(user.entranceDetails[0].images.replace("/home/nepatron/", "https://"))}
                        />

                      </div>
                      <div>
                        <p>
                          <strong>Parents:</strong> {user.entranceDetails[0].parentsName}
                        </p>
                        <p>
                          <strong>Parents Occupation:</strong> {user.entranceDetails[0].parentsOccupation}
                        </p>
                        <p>
                          <strong>Interested Course:</strong> {user.entranceDetails[0].interestedCourse}
                        </p>
                        <p>
                          <strong>Know us:</strong> {user.entranceDetails[0].knowUs}
                        </p>
                        <p>
                          <strong>Why do you need Scholarship:</strong> {user.entranceDetails[0].whyScholarship}
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
      {fullScreenImage && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <span className={styles.close}>&times;</span>
          <img
            className={styles.modalContent}
            src={fullScreenImage}
            alt="Full Screen"
          />
        </div>
      )}
    </div>
  );
};

export default Result;
