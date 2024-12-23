import React, { useContext, useState, useEffect, useRef } from "react";
import styles from "../styles/Header.module.css";
import HimalayanLogo from "../assets/HimalayanLogo.svg";
import { IoMdMenu } from "react-icons/io";
import { Global_user } from "../GlobalVar/GlobalVars";
import { useNavigate } from "react-router-dom";
import { handleLogOut } from "../functions/LogHandler";
import { student_status, entrance_status } from "../api/Api.jsx";
import CircularProgress from "@material-ui/core/CircularProgress";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useContext(Global_user);
  const nav = useNavigate();
  const { setuser } = useContext(Global_user);
  const [userCheck, setuserCheck] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Ref for the menu container
  const menuRef = useRef(null);

  useEffect(() => {
    // Event listener to handle clicks outside of the menu
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Adding event listener to the document body
    document.body.addEventListener("click", handleOutsideClick);

    // Cleanup function to remove event listener
    return () => {
      document.body.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const userFromLocalStorage = localStorage.getItem("user");
    if (!userFromLocalStorage) {
      setuser(null);
    } else {
      setuser(JSON.parse(userFromLocalStorage));
    }
  }, [setuser]);

  const toggleMenu = (event) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const logBtnHandler = () => {
    if (user) {
      handleLogOut(setuser);
    }
    return nav("/");
  };

  const mockHandler = () => {
    setIsLoading(true);
    const user_role = JSON.parse(localStorage.getItem("user"));
    const fetchData = async () => {

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(student_status, {
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

        if (data.data.requestStatus === "no_request" || data.data.requestStatus === "declined") {
          return nav("/student/req-mock");
        } else if (data.data.requestStatus === "pending") {
          return nav("/student/paidPending");
        } else if (data.data.requestStatus === "approved") {
          return nav("/all/paidExam", { state: { iddata: data.data } });
        } else if (data.data.requestStatus === "given") {
          return nav("/student/req-mock");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false);
      }
    };

    if (user_role.role === "student") {
      fetchData();
    } else {
      setIsLoading(false);
      return nav("/admin/receiveMock");
    }
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
          setIsLoading(false);
          throw new Error("Network response was not ok");
        }
        setIsLoading(false);
        const data = await response.json();

        if (data.data.examStatus === "enable") {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user.entrance === 'notgiven') {
            return nav("/all/entranceexam", { state: { iddata: data.data } });
          } else {
            alert("You have already given entrance. Please try again after a while!");
          }

        } else if (data.data.examStatus === "disable") {
          // return nav("/student/paidPending");
          setIsLoading(false);
          alert("Admin has not enabled Entrance");

        } else {
          setIsLoading(false);
          alert("Admin has not enabled Entrance");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false);
      }
    };

    if (user_role.role === "student") {
      fetchData();
    } else {
      setIsLoading(false);
      return nav("/admin/entranceresult");
    }
  };

  const ResultsHandler = () => {
    nav("/result");
  };
  const homeHandler = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role === "student") {
      return nav("/student/studentmodel")
    } else {
      return nav("/admin/AdminDashboard");
    }
  }
  return (
    <nav className={styles.navbar}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      <img
        src={HimalayanLogo}
        className={styles.collegelogo}
        alt="College Logo"
        onClick={homeHandler}
      />
      <div onClick={toggleMenu}>
        <IoMdMenu className={styles.line} />
      </div>
      <div
        className={`${styles.menu} ${isMenuOpen ? styles.open : ""}`}
        ref={menuRef}
      >{user && (
        <>
          <button className={styles.navbtn} onClick={mockHandler}>
            Mock test
          </button>
          <button className={styles.navbtn} onClick={EntranceHandler} >
            Entrance
          </button>
          <button className={styles.navbtn} onClick={ResultsHandler}>
            Result
          </button>
        </>
      )}
        <button className={styles.navbtn}>Resources</button>
        <button
          className={styles.navbtn}
          onClick={() => window.location.href = 'https://www.hcm.edu.np/contact-us'}
        >
          Contact
        </button>

        <button className={styles.dynamic} onClick={logBtnHandler}>
          {user ? "Log out" : "Log in"}
        </button>
      </div>
    </nav>
  );
};

export default Header;
