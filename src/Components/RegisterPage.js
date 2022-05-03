import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../constants";
import { useHistory } from "react-router-dom";
import "../styles/Register.scss";

// POST /auth/signup
function RegisterPage() {
  let history = useHistory();
  let [email, setEmail] = useState("");
  let [pwd, setPwd] = useState("");
  let [checkPwd, setCheckPwd] = useState("");
  let [name, setName] = useState("");

  let [pwdLength, setPwdLength] = useState(false);
  const emailEvent = (e) => {
    setEmail(e.target.value);
  };
  const pwdEvent = (e) => {
    setPwd(e.target.value);
    if (e.target.value.length >= 8) {
      setPwdLength(true);
    } else {
      setPwdLength(false);
    }
  };
  const checkPwdEvent = (e) => {
    setCheckPwd(e.target.value);
  };
  const nameEvent = (e) => {
    setName(e.target.value);
  };
  const submitEvent = (e) => {
    e.preventDefault();
    if (pwd !== checkPwd) {
      return alert("비밀번호 확인이 틀립니다.");
    }

    let body = {
      email: email,
      password: pwd,
      name: name,
    };
    axios
      .post(`${API_URL}/auth/user`, body)
      .then((res) => {
        if (res.status === 200) {
          alert("회원가입 완료!");
          history.push("/user/login");
        }
      })
      .catch((error) => console.log(error));
  };
  return (
    <>
      <div className="Info-nav-bar">
        <p>Together Coding</p>
      </div>
      <div className="register-container">
        <div className="register-form">
          <form onSubmit={submitEvent}>
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={emailEvent}
              required
            ></input>
            <label>비밀번호 (영어,숫자포함 8~20자리)</label>
            <span>
              {pwdLength ? null : (
                <span style={{ color: "red", fontSize: "10px" }}>
                  8자리 이상으로 입력하세요
                </span>
              )}
            </span>
            <input type="password" value={pwd} onChange={pwdEvent} required />
            <label>비밀번호 확인</label>
            <input
              type="password"
              value={checkPwd}
              onChange={checkPwdEvent}
              required
            />
            <label>이름</label>
            <input value={name} onChange={nameEvent} required />
            <button>회원가입</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
