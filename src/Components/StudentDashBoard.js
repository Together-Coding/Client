import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/StudentDashBoard.scss";

function StudentDashBoard() {
  let lessons = [1, 2, 3, 4, 5, 6];
  const location = useLocation();
  return (
    <div>
      <div className="stu-nav-bar">{location.state.class}</div>
      <div className="stu-main">
        {lessons.map((x) => {
          return (
            <div className="lessons">
              <p>{x}주차</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentDashBoard;
