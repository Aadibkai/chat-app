import { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged, auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [detailsImg, setDetailsImg]=useState()

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
    unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;
  const handleAddImage=(item)=>{
   setDetailsImg(item)
  }
  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat AddedImg={handleAddImage}/>}
          {chatId && <Detail detailsImg={detailsImg}/>}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
