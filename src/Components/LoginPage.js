import React, { useState } from "react";
import axios from "axios";

function LoginPage() {
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
    axios.post("/auth/signin", body).then((res) => {
      let token = res.data;
      localStorage.setItem("access_token", token);
    });
    let token = localStorage.getItem("access_token");
    const authAxios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    authAxios.get("url...").then((res) => {
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
