import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/CodeModal.scss";
import {useHistory} from "react-router-dom";

function CodeModal() {
  const location = useLocation();
  let history=useHistory();
  return (
    <div className="code-container">
      <button onClick={()=>{
        history.goBack();
      }}>뒤로</button>
      <h1>질문 코드 페이지 입니다.</h1>
      <div className="code-box">{location.state.code}</div>
    </div>
  );
}

export default CodeModal;
