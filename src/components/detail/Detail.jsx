import React, { useState, useEffect, useCallback } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const MAX_IMG_HISTORY = 7;

const Detail = ({ detailsImg }) => {
  const {
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();
  const [showPhotos, setShowPhotos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imgHistory, setImgHistory] = useState([]);

  useEffect(() => {
    if (detailsImg && detailsImg.url) {
      setShowPhotos(true);
    } else {
      setShowPhotos(false);
    }
  }, [detailsImg]);

  const handleSetImg = useCallback(() => {
    if (detailsImg && detailsImg.url) {
      const newImgHistory = [
        detailsImg,
        ...imgHistory.filter((img) => img.url !== detailsImg.url),
      ];
      const trimmedImgHistory = newImgHistory.slice(0, MAX_IMG_HISTORY);
      setImgHistory(trimmedImgHistory);
    }
  }, [detailsImg, imgHistory]);

  useEffect(() => {
    handleSetImg();
  }, [handleSetImg]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user.id)
          : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.error("Error blocking user:", err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  const togglePhotos = () => {
    setShowPhotos(!showPhotos);
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "img/avatar.png"} alt="User Avatar" />
        <h2>{user?.username}</h2>
      </div>
      <div className="info">
        <div className="option" onClick={togglePhotos}>
          <div className="title">
            <span style={{ cursor: "pointer" }}>Shared Photos</span>
            <img
              src={showPhotos ? "img/arrowUp.png" : "img/arrowDown.png"}
              alt="Toggle Arrow"
            />
          </div>
          {showPhotos && (
            <div className="photos">
              {imgHistory.map((img, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    <img src={img.url} alt={`img-${index}`} />
                    <span>{img.file.name}</span>
                  </div>
                  <img
                    src="img/download.png"
                    alt="Download Icon"
                    className="icon"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="option" onClick={toggleVisibility}>
          <div className="title">
            <span style={{ cursor: "pointer" }}>Privacy & Help</span>
            <img
              src={isVisible ? "img/arrowUp.png" : "img/arrowDown.png"}
              alt="Toggle Arrow"
            />
          </div>
          {isVisible && (
            <p style={{ fontSize: "12px", opacity: "0.4" }}>
              Information Collection: We collect your name, email, chat
              messages, and usage data. Use of Information: To provide, improve,
              and personalize our services. Data Sharing: We don’t sell your
              data. Shared only with your consent or for legal reasons. Data
              Security: We protect your data but can't guarantee complete
              security.
            </p>
          )}
        </div>
        <div className="option">
          <div className="title">
            <span style={{ cursor: "pointer" }}>Shared Files</span>
            <img src="img/arrowUp.png" alt="Toggle Arrow" />
          </div>
        </div>
        <button
          className={`blockButton ${
            isCurrentUserBlocked || isReceiverBlocked ? "blocked" : ""
          }`}
          onClick={handleBlock}
        >
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User Blocked"
            : "Block User"}
        </button>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
