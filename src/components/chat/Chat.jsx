import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = ({ AddedImg }) => {
  const [chat, setChat] = useState(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState({ file: null, url: "" });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    if (chat?.messages) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

  useEffect(() => {
    if (chatId) {
      const unsubscribe = onSnapshot(doc(db, "chats", chatId), (snapshot) => {
        setChat(snapshot.data());
      });

      return () => unsubscribe();
    }
  }, [chatId]);

  const handleImg = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result;
        setImageFile({
          file: file,
          url: imageUrl,
        });

        // Pass image data to parent component
        AddedImg({ file: file, url: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessageText((prevText) => prevText + emojiObject.emoji);
    setOpenEmojiPicker(false);
  };

  const handleSend = async () => {
    if (messageText.trim() === "") return;

    let imageUrl = null;

    try {
      if (imageFile.file) {
        imageUrl = await upload(imageFile.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: messageText.trim(),
          createdAt: new Date(),
          ...(imageUrl && { img: imageUrl }),
        }),
      });

      // Clear image and message input after sending
      setImageFile({ file: null, url: "" });
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "img/avatar.png"} alt="User Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Urgent Messages Only</p>
          </div>
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            key={message.createdAt.toMillis()}
            className={message.senderId === currentUser?.id ? "message own" : "message"}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="Sent by user" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {imageFile.url && (
          <div className="message own">
            <div className="texts">
              <img src={imageFile.url} alt="Uploaded" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="img/img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: 'none' }}
            onChange={handleImg}
          />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="img/emoji.png"
            alt="Emoji Icon"
            onClick={() => setOpenEmojiPicker((prev) => !prev)}
          />
          {openEmojiPicker && (
            <div className="emojiPicker">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
