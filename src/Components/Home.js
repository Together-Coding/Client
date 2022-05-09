import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import { useHistory } from "react-router-dom";
import "../styles/Home.scss";
function Home() {
  console.log(localStorage.getItem("access_token"));
  const history = useHistory();
  const logOutCtrl = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      history.push("/");
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
        <div>
          {localStorage.getItem("access_token") !== null ? (
            <>
              <span>
                <Link to="/me">내 정보</Link>
              </span>
              <button onClick={logOutCtrl}>로그아웃</button>
            </>
          ) : (
            <>
              <span>
                <Link to="/user/login">로그인</Link>
              </span>
              <span>
                <Link to="/user/register">회원가입</Link>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="home-container">
        <h1>Home</h1>
      </div>
    </>
  );
}

export default Home;
