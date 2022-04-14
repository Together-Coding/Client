import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/CodeModal.scss";

function CodeModal() {
  const location = useLocation();

  return (
    <div className="code-container">
      <h1>질문 코드 페이지 입니다.</h1>
      <div className="code-box">{location.state.code}</div>
    </div>
  );
}

export default CodeModal;
