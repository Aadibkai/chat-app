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

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState({ file: null, url: "" });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  const handleImg = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile({
          file: file,
          url: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

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

      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = messageText.trim();
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setImageFile({ file: null, url: "" });
      setMessageText("");
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
              {message.img && <img src={message.img}  />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {imageFile.url && (
          <div className="message own">
            <div className="texts">
              <img src={imageFile.url} alt="Uploaded Image" />
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
