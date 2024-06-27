import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {
  const { currentUser } = useUserStore();

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "img/avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      {/* <div className="icons">
        <img src="img/more.png" alt="" />
        <img src="img/video.png" alt="" />
        <img src="img/edit.png" alt="" />
      </div> */}
    </div>
  );
};

export default Userinfo;
