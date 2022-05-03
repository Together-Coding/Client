import React from "react";
import { Link, Switch, Route } from "react-router-dom";
import "../styles/Home.scss";
function Home() {
  return (
    <>
      <div className="Info-nav-bar">
        <p>Together Coding</p>
        <div>
        <span>
          <Link to="/user/login">로그인</Link>
          </span>
        <span>
          <Link to="/user/register">회원가입</Link>
        </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          height: "auto",
        }}
      >
        <h2>
          <Link to="/IDE">IDE 껍다구 링크</Link>
        </h2>
        <h2>
          <Link to="/me">로그인 했을시 내정보</Link>
        </h2>
      </div>
    </>
  );
}

export default Home;
