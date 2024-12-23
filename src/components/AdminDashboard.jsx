import React, { useState, useEffect } from "react";
import styles from "../styles/AdminDashboard.module.css";
import ShowAdminData from "./ShowAdminData.jsx";
import { SiMicrosoftexcel } from "react-icons/si";
import { IoIosArrowForward } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { NavLink, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  question_view,
  admin_del_questions,
  admin_excel,
} from "../api/Api.jsx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import csv from "csvtojson";
const AdminDashboard = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // State for confirmation popup
  const nav = useNavigate();
  const handleDelete = (id) => {
    setDeleteConfirmation({ id });
  };

  const confirmDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);

      const response = await fetch(admin_del_questions, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify({ id: deleteConfirmation.id }),
      });

      if (!response.ok) {
        navigate("/error");
        throw new Error("Network response was not ok");

      }

      // Remove the deleted model from the state
      setModels(models.filter((model) => model.id !== deleteConfirmation.id));
    } catch (error) {
      console.error("Delete error:", error);
      navigate("/error");
    } finally {
      // Close the confirmation popup
      setDeleteConfirmation(null);

    }
  };
  const handleAddModel = () => {
    nav("/admin/addmodel");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user.token;
        const encodedToken = encodeURIComponent(token);
        const response = await fetch(question_view, {
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

        // Map data to extract modelName and id
        const updatedModels = data.map((item) => ({
          modelName: item.model_name,
          id: item._id,
        }));

        setModels(updatedModels);
        setIsLoading(false)
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, []);
  const handleExcel = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const response = await fetch(admin_excel, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const csvData = await response.text();
      const jsonData = await csv().fromString(csvData); // Parse CSV string to JSON array
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });
      const excelData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(excelData, "StudentsCMAT.xlsx");
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };
  const handleView = (id) => {
    return nav(`/all/exam/${id}`);
  };

  return (
    <div className={styles.modelContainer}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}
      {models.map((model) => (
        <div key={model.id} className={styles.modelCard}>
          <div className={styles.modelName}>
            <h3>{model.modelName}</h3> {/* Corrected property name */}
          </div>
          <button
            className={styles.viewButton}
            onClick={() => handleView(model.id)}
          >
            <IoIosArrowForward />
          </button>
          <button
            onClick={() => handleDelete(model.id)}
            className={styles.deleteButton}
          >
            <MdDelete />
          </button>
        </div>
      ))}
      {/* Confirmation popup */}
      {deleteConfirmation && (
        <div className={styles.confirmationPopup}>
          <p>Are you sure you want to delete?</p>
          <button onClick={confirmDelete}>Delete</button>
          <button onClick={() => setDeleteConfirmation(null)}>Cancel</button>
        </div>
      )}
      <br />

      <button
        type="submit"
        className={styles.containerButton}
        onClick={handleAddModel}>Add Model
      </button>

      <br />
      <br />
      <center>
        <h1>User Details</h1>
      </center>
      <div className={styles.userDetailContainer}>
        <div className={styles.excelButtonContainer}>
          <button className={styles.excelButton} onClick={handleExcel}>
            Export Excel &nbsp;
            <SiMicrosoftexcel />
          </button>
        </div>
        <br />
        <ShowAdminData />
      </div>
    </div>
  );
};

export default AdminDashboard;
