import React, { useState } from "react";
import styles from "../styles/Signup.module.css";
import { Link, useNavigate } from "react-router-dom";
import { reg_user } from "../api/Api.jsx";
import CircularProgress from "@material-ui/core/CircularProgress";

const Signup = () => {
  const navigate = useNavigate();
  const data = {
    fullName: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    previous: "",
    education: {
      level: "",
      gpa: "",
    },
  };
  const [inputData, setInputData] = useState(data);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (
      !inputData.fullName ||
      !inputData.email ||
      !inputData.phone ||
      !inputData.password ||
      !inputData.address ||
      !inputData.previous
    ) {
      setError("All fields marked with * are required.");
      return false;
    }
    return true;
  };


  const handleData = (e) => {
    const { name, value } = e.target;
    // If the field belongs to the education object
    if (name.startsWith("education.")) {
      const field = name.split(".")[1]; // Extract the nested field name
      setInputData({
        ...inputData,
        education: {
          ...inputData.education,
          [field]: value, // Update the nested field immutably
        },
      });
    } else {
      // If the field does not belong to the education object
      setInputData({ ...inputData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(reg_user, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
      });

      if (res.ok) {
        navigate("/")
        setIsLoading(false);

      } else {
        setError(error.message);
        setIsLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      <form>
        <h1 className={styles.signupText}>Sign up</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.input}>
          <input
            type="text"
            placeholder="Full Name"
            name="fullName"
            className={styles.signupInput}
            value={inputData.fullName}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="text"
            placeholder="Email"
            name="email"
            className={styles.signupInput}
            value={inputData.email}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="tel"
            placeholder="Phone number"
            name="phone"
            className={styles.signupInput}
            value={inputData.phone}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="text"
            placeholder="Address"
            name="address"
            className={styles.signupInput}
            value={inputData.address}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="password"
            placeholder="Password"
            name="password"
            className={styles.signupInput}
            value={inputData.password}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="password"
            placeholder="Confirm Password"
            className={styles.signupInput}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="text"
            placeholder="Previous College"
            name="previous"
            className={styles.signupInput}
            value={inputData.previous}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="text"
            id="qualification"
            name="education.level"
            placeholder="Qualification"
            className={styles.signupInput}
            value={inputData.education.level}
            onChange={handleData}
            required
          />
        </div>
        <div className={styles.input}>
          <input
            type="text"
            id="gpa"
            name="education.gpa"
            placeholder="GPA"
            pattern="[0-3]\.\d\d|4\.00"
            title="Enter a GPA between 0.00 and 4.00"
            className={styles.signupInput}
            value={inputData.education.gpa}
            onChange={handleData}
            required
          />
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          className={styles.containerButton}
        >
          Sign Up
        </button>
        <p className={styles.para}>
          Already have an account?{" "}
          <Link className={styles.paratext} to={"/"}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup
