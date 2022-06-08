import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import { useHistory } from "react-router-dom";
import "../styles/Home.scss";
import HOME_IMAGE from "../images/home-image.png";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function Home() {
  console.log(localStorage.getItem("access_token"));
  const history = useHistory();
  const logOutCtrl = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      window.location.replace("/");
    } else {
      return false;
    }
  };
  return (
    <>
      <div className="Info-nav-bar">
        <p className="title">
          <Link to="/">Together Coding</Link>
        </p>
      </div>
      <div className="home-container">
        
        <img src={HOME_IMAGE} alt="home" />
        
        <div className="login-info-container">
          {localStorage.getItem("access_token") !== null ? (
            <>
              <span className="home-my-class-info">
                <Link to="/me">내 강의 정보</Link>
              </span>
              <button className="home-logout-btn" onClick={logOutCtrl}>로그아웃</button>
            </>
          ) : (
            <>
            
              <span className="login-logout">
                <Link to="/user/login">Together-Coding 로그인</Link>
              </span>
              <span className="register">
              <FontAwesomeIcon icon={faUser} /><Link to="/user/register">회원가입</Link>
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
