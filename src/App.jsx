import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header.jsx";
import AddModel from "./components/AddModel.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LogIn from "./components/LogIn.jsx";
import Signup from "./components/Signup.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import StudentModel from "./components/StudentModel.jsx";
import Exam from "./components/Exam.jsx";
import Result from "./components/Result.jsx";
import { Global_user } from "./GlobalVar/GlobalVars.js";
import Mocker from "./components/Mocker.jsx";
import PaidExam from "./components/PaidExam.jsx";
import EntranceExam from "./components/EntranceExam.jsx";
import Error from "./components/Error.jsx";
import Pending from "./components/Pending.jsx";
import AdminQrModel from "./components/AdminQrModel.jsx";
import EntranceResult from "./components/EntranceResult.jsx"

const App = () => {
  const [user, setuser] = useState();
  const [error, seterror] = useState(false);

  useEffect(() => {
    const isUser = JSON.parse(localStorage.getItem("user"));
    // const iserror = JSON.parse(localStorage.getItem("error"));

    if (isUser) {
      setuser(isUser);
    }

    // if (iserror) {
    //   seterror(true);
    // }
  }, []);
  return (
    <Global_user.Provider value={{ user, setuser }}>
      <Router>
        <Header />
        <Routes>
          {/* home change */}
          <Route path="/" element={<LogIn />} />
          <Route path="/error" element={<Error />} />
          <Route path="/signup" element={<Signup />} />

          {/* admin only */}
          {user?.role === "admin" && (
            <Route path="/admin/addmodel" element={<AddModel />} />
          )}

          {user?.role === "admin" && (
            <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
          )}
          {/* 
          {user?.role === "admin" && (
            <Route path="/admin/showadmindata" element={<ShowAdminData />} />
          )} */}
          {/* Student only */}
          {user?.role === "student" && (
            <Route path="/student/studentmodel" element={<StudentModel />} />
          )}
          {user?.role === "student" && (
            <Route path="/student/paidPending" element={<Pending />} />
          )}

          {user?.role === "student" && (
            <Route path="/student/req-mock" element={<Mocker />} />
          )}
          {user && <Route path="/all/paidExam" element={<PaidExam />} />}
          {user && <Route path="/all/entranceexam" element={<EntranceExam />} />}
          {user && <Route path="/all/exam/:id" element={<Exam />} />}

          {user && <Route path="/result" element={<Result />} />}

          {user?.role === "admin" && (
            <Route path="/admin/receiveMock" element={<AdminQrModel />} />
          )}
          {user?.role === "admin" && (
            <Route path="/admin/entranceresult" element={<EntranceResult />} />
          )}
        </Routes>
      </Router>
    </Global_user.Provider>
  );
};

export default App;
