import React from "react";
import styles from "../styles/Error.module.css";

const Error = () => {
  return (
    <center>
      <div className={styles.container}>
        <div className={styles.section}>
          <h1 class={styles.error}>404</h1>
          <div class={styles.page}>
            Ooops!!! The page you are looking for is not found
          </div>
          <a class={styles.backHome} href="/">
            Back to login
          </a>
        </div>
      </div>
    </center>
  );
};

export default Error;
