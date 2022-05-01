import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../constants";
import { useHistory } from "react-router-dom";

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
          history.push("/myInfo");
        } else {
          alert("아이디, 비밀번호를 확인 하세요");
        }
      })
      .catch((res) => {
        console.log(res);
      });
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={submitEvent}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <label>이메일(아이디)</label>
        <input type="email" value={email} onChange={emailEvent}></input>
        <label>비밀번호</label>
        <input type="password" value={pwd} onChange={pwdEvent} />
        <button>로그인</button>
      </form>
    </div>
  );
}

export default LoginPage;
