import React, { useState } from "react";
import "../styles/MyInfoFix.scss";
import { API_URL } from "../constants";
import axios from "axios";
import { Link } from "react-router-dom";

function MyInfoFix() {
  let headers = {
    Authorization: "Bearer " + localStorage.getItem("access_token") || "",
  };

  let [changeName, setChangeName] = useState("");

  let [nowPwd, setNowPwd] = useState("");
  let [changePwd, setChangePwd] = useState("");
  let [checkPwd, setCheckPwd] = useState("");

  let [pwdLength, setPwdLength] = useState(false);

  let [checkInputPwd, setCheckInputPwd] = useState(false);

  const pwdEvent = (e) => {
    setChangePwd(e.target.value);
    if (e.target.value.length >= 8) {
      setPwdLength(true);
    } else {
      setPwdLength(false);
    }
  };
  const checkPwdEvent = (e) => {
    setCheckPwd(e.target.value);
    if (e.target.value == changePwd) {
      setCheckInputPwd(true);
    } else {
      setCheckInputPwd(false);
    }
  };
  // 이름 변경 요청 함수
  const changeNameBtn = () => {
    axios
      .put(
        `${API_URL}/api/user`,
        {
          name: changeName,
        },
        { headers }
      )
      .then((res) => {
        console.log(res);
      });
  };
  // 비밀번호 변경 요청 함수
  const changePwdBtn = () => {
    let body = {
      currentPassword: nowPwd,
      newPassword: changePwd,
      checkPassword: checkPwd,
    };
    axios.put(`${API_URL}/api/password`, body, { headers }).then((res) => {
      console.log(res);
    });
  };

  return (
    <>
      <div className="Info-nav-bar">
        <p>
          <Link to="/">Together Coding</Link>
        </p>
      </div>
      <div className="fix-info-box">
        <div className="change-name-box">
          <label>이름 변경</label>
          <input
            onChange={(e) => {
              setChangeName(e.target.value);
            }}
          />
          <button onClick={changeNameBtn}>이름 변경</button>
        </div>
        <div className="change-pwd-box">
          <h3>비밀 번호 변경</h3>
          <label>현재 비밀번호</label>
          <input
            type="password"
            onChange={(e) => {
              setNowPwd(e.target.value);
            }}
          />
          <label>변경할 비밀번호</label>
          <span>
            {pwdLength ? null : (
              <span style={{ color: "red", fontSize: "10px", marginLeft: 2 }}>
                8자리 이상으로 입력하세요
              </span>
            )}
          </span>
          <input type="password" onChange={pwdEvent} />
          <label>변경할 비밀번호 확인</label>
          <span>
            {checkInputPwd ? null : (
              <span style={{ color: "red", fontSize: "10px", marginLeft: 2 }}>
                비밀번호 확인이 다릅니다.
              </span>
            )}
          </span>
          <input onChange={checkPwdEvent} type="password" />
          <button onClick={changePwdBtn}>비밀 번호 변경</button>
        </div>
      </div>
    </>
  );
}

export default MyInfoFix;
