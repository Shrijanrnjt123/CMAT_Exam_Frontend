import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/Login.module.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { handleLogIn } from "../functions/LogHandler";
import { Global_user } from "../GlobalVar/GlobalVars";
import CircularProgress from "@material-ui/core/CircularProgress";

const Login = () => {
  const [loginData, setloginData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleData = (e) => {

    const { name, value } = e.target;
    setloginData((prev) => ({ ...prev, [name]: value }));
  };
  const nav = useNavigate();
  const { setuser } = useContext(Global_user);
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className={styles.logInDiv}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      <div className={styles.wrapper}>
        <form
          onSubmit={(e) => {
            setIsLoading(true);
            handleLogIn(e, nav, loginData, setuser);
            setIsLoading(false);
          }}
        >
          <h1 className={styles.loginText}>Log in</h1>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Email"
              name="email"
              className={styles.loginInput}
              onChange={handleData}
              required
            />
          </div>
          <br />
          <div className={styles.input}>
            <input
              type="password"
              placeholder="Password"
              name="password"
              className={styles.loginInput}
              onChange={handleData}
              required
            />
          </div>
          <br />
          <br />
          <button type="submit" className={styles.containerButton}>
            Login
          </button>
          <p className={styles.paralogin}>
            Don't have an account?
            <NavLink className={styles.linksign} to={"/signup"}>
              Sign up
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
};
export default Login;
