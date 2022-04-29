import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/StudentDashBoard.scss";

function StudentDashBoard() {
  const location=useLocation();
  return (
    <div>
      <h2>{location.state.week}주차 수업 페이지</h2>
    </div>
  );
}

export default StudentDashBoard;
