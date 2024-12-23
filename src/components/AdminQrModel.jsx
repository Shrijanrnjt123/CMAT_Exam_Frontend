import React, { useState, useEffect } from "react";
import styles from "../styles/AdminQrmodel.module.css";
import { paid_req, change_status } from "../api/Api.jsx";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useNavigate } from "react-router-dom";

const AdminQrModel = () => {
  const [requests, setRequests] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nav = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const response = await fetch(paid_req, {
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

      const { data } = await response.json();
      setRequests(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setIsLoading(false);
      // navigate("/error"); // Uncomment and define navigate if you need to handle errors by redirecting
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    const data = {
      status: "approved",
      requestId: id
    };
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(change_status, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        useEffect(() => {
          fetchData();
        })
      } else {
        setIsLoading(false);
        // Handle error if needed
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleDecline = async (id) => {
    const data = {
      status: "declined",
      requestId: id
    };
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(change_status, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${encodedToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        useEffect(() => {
          fetchData();
        })
      } else {
        setIsLoading(false);
        // Handle error if needed
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleViewImage = (id, imagePath) => {
    setSelectedImageId(id);
  };

  const viewfullimage = (id, imagePath) => {
    setFullScreenImage(imagePath);
  };

  const handleCloseModal = () => {
    setFullScreenImage(null);
  };

  return (
    <div className={styles.adminQrModel}>
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.loaderContainer}>
            <CircularProgress />
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className={styles.noRequestsMessage}>No requests</div>
      ) : (
        requests.map((request) => {
          // Modify the image path as needed
          const imagePath = request.images.replace("/home/nepatron/", "https://");

          return (
            <div key={request.id} className={styles.requestContainer}>
              <div className={styles.accordionItem}>
                <div className={styles.accordionHeader}>
                  <div className={styles.userInfo}>
                    <span>{request.name}</span>
                    <span>{request.createdAt}</span>
                  </div>
                  <button
                    className={styles.viewImageBtn}
                    onClick={() => handleViewImage(request.id, imagePath)}
                  >
                    View Image
                  </button>
                </div>
                {selectedImageId === request.id && (
                  <div className={styles.imageAndActionContainer}>
                    <div className={styles.imageContainer}>
                      <img
                        src={imagePath}
                        onError={(e) => {
                          console.error(`Error loading image: ${imagePath}`);
                          e.target.src = "https://via.placeholder.com/150"; // Fallback image
                        }}
                        className={styles.img}
                        alt="Selected Image"
                        onClick={() => viewfullimage(request._id, imagePath)}
                      />
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleApprove(request._id)}
                        className={`${styles.actionButton} ${styles.approveBtn}`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(request._id)}
                        className={`${styles.actionButton} ${styles.declineBtn}`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {fullScreenImage && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <span className={styles.close}>&times;</span>
          <img
            className={styles.modalContent}
            src={fullScreenImage}
            alt="Full Screen"
          />
        </div>
      )}
    </div>
  );
};

export default AdminQrModel;
