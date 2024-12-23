import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Mocker.module.css";
import { req_mock, change_status, student_status } from "../api/Api.jsx";
import qr from "../assets/qr.png";
import add from "../assets/add.jpg";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";


export default function Mocker() {
  const imgRef = useRef(null);
  const [file, setFile] = useState(null);
  const [blob, setBlob] = useState("");
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      return alert("Please insert a screenshot.");
    }
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        return alert("User not authenticated. Please log in.");
      }
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const formData = new FormData();
      formData.append("image", file); // Ensure this key matches your backend

      const response = await fetch(req_mock, { // Replace with your actual endpoint
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${encodedToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoading(false);
        nav("/student/paidPending");
      } else {
        alert(`Failed to upload file. ${data.message || data.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
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
    const urlObj = URL.createObjectURL(file);
    setBlob(urlObj);
  };

  return (
    <div className={styles.mockContainer}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      <center>
        <img src={qr} alt="QR Code" className={styles.qr} />
        <p>
          How to Request a Mock Test?
          <br />
          <br />
          <strong>Pay Rs 100 </strong>by scanning the QR code.
          <br />
          <strong>Upload the payment screenshot </strong>below.
          <br />
          <strong>Wait for approval, </strong>Will be approved after payment verified
          <br />
          <br />
          Once your payment is confirmed, you will receive access to the mock test.<br />
        </p>
        <br />
        <br />
        <p>Scan and send your screenshot</p>
        <input
          type="file"
          onChange={imageHandler}
          ref={imgRef}
          style={{ display: "none" }}
        />
        <img
          src={blob || add}
          alt="Add"
          className={styles.qr}
          style={{ boxShadow: "0 0 10px gray", cursor: "pointer" }}
          onClick={() => imgRef.current.click()}
        />
        <br />
        <br />
        <br />
        <button
          className={styles.button}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </center>
    </div>
  );
}