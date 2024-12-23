import React from "react";
import styles from "../styles/Pending.module.css";
import { Link } from "react-router-dom";

const Pending = () => {
  return (
    <div className={styles.container}>
      <div className={styles.containerText1}>Your request is Pending....</div>
      <div className={styles.containerText2}>Please wait for a while!!!</div>
      <div className={styles.containerText3}>
        Our Team will approve within 24 hours and if any issues please contact
        us.
      </div>
      <button className={styles.btn}>
        <Link to="/student/studentmodel">Back Home</Link>
      </button>
    </div>
  );
};

export default Pending;
