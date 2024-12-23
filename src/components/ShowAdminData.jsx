import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import styles from "../styles/ShowAdminData.module.css";
import { admin_allusers } from "../api/Api.jsx";
import { useNavigate } from "react-router-dom";

const ShowAdminData = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(admin_allusers, {
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
        setUserData(data);
      } catch (error) {
        console.error("Fetch error:", error);
        navigate("/error");
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className={styles.userContainer}>
      {userData.map((user, index) => (
        <div key={user._id} className={styles.userCard}>
          <div className={styles.userIcon}>
            <FaUser />
          </div>
          <div className={styles.userDetails}>
            <div
              className={styles.userHeader}
              onClick={() => toggleAccordion(index)}
            >
              <h3>{user.fullName}</h3>
              <span>
                Joined Date: {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            {user.isOpen && (
              <div className="user-info">
                <p>
                  <strong>Address:</strong> {user.address}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone}
                </p>
                <p>
                  <strong>Qualification:</strong>
                  <br />
                  <br />
                  <strong>Level: </strong>
                  {user.education[0].level} <br />
                  <strong>GPA: </strong>
                  {user.education[0].gpa}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowAdminData;
