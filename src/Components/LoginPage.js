import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../constants";
import { Link, useHistory } from "react-router-dom";
import "../styles/Login.scss";

function LoginPage() {
  let history = useHistory();
  let [email, setEmail] = useState("");
  let [pwd, setPwd] = useState("");

  const emailEvent = (e) => {
    setEmail(e.target.value);
  };
  const pwdEvent = (e) => {
    setPwd(e.target.value);
  };
  const submitEvent = (e) => {
    e.preventDefault();

    let body = {
      email: email,
      password: pwd,
    };
    /*
    let headers = {
      Authorization: "Bearer " + localStorage.getItem("access_token") || "",
    };*/
    axios
      .post(`${API_URL}/auth/login`, body)
      .then((res) => {
        let token = res.data;
        localStorage.setItem("access_token", token);
        if (res.status === 200) {
          history.push("/me");
        } else {
          alert("아이디, 비밀번호를 확인 하세요");
        }
      })
      .catch((res) => {
        console.log(res);
      });
  };
  return (
    <>
      <div className="Info-nav-bar">
        <p>Together Coding</p>
      </div>
      <div className="login-container">
        <div className="login-form">
          <form onSubmit={submitEvent}>
            <label>이메일(아이디)</label>
            <input
              type="email"
              value={email}
              onChange={emailEvent}
              required
            ></input>
            <label>비밀번호</label>
            <input type="password" value={pwd} onChange={pwdEvent} required />
            <button>로그인</button>
          </form>
          <div className="bottom-form">
            <label style={{ fontSize: 16 }}>
              아직 Together Coding의 회원이 아니시라면
            </label>
            <button style={{ marginTop: 5 }}>
              <Link to="/user/register">회원 가입</Link>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
