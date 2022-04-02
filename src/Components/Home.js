import React from "react";
import { Link, Switch, Route } from "react-router-dom";

function Home() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>어서오세요</h1>
      <h2>
        <Link to="/IDE">IDE 껍다구 링크</Link>
      </h2>
      <button>
        <Link to="/login">로그인</Link>
      </button>
      <label>아직 회원이 아니시라면</label>
      <button>
        <Link to="/register">회원가입</Link>
      </button>
    </div>
  );
}

export default Home;
