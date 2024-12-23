import { useContext } from "react";
import { login_reg } from "../api/Api.jsx";
import { Global_user } from "../GlobalVar/GlobalVars.js";

export const handleLogIn = async (e, nav, loginData, setuser) => {

  e.preventDefault();
  try {
    const res = await fetch(login_reg, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    if (!res.ok) {
      return alert("Incorrect Email Or Password");
    }

    const parse = await res.json();
    if (!parse.success) {
      localStorage.setItem("error", true);
    }
    const userInfo = {
      token: parse?.data?.accessToken,
      role: parse?.data?.user?.role,
      entrance: parse?.data?.user?.entrance
    };
    await setuser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
    const user_role = JSON.parse(localStorage.getItem("user"))?.role;

    switch (user_role) {
      case "student":
        return nav("/student/studentmodel");
      case "admin":
        return nav("/admin/AdminDashboard");
    }
  } catch (error) {
    console.log(error);
  }
};

export const handleLogOut = async (setuser) => {
  localStorage.clear();
  return setuser(null);
};
