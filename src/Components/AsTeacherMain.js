import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsTeacherMain.scss";

function AsTeacherMain() {
  const location = useLocation();
  const lesson = [
    { week: 1, classOpen: true, date: "04-15 ~ 04-22" },
    { week: 2, classOpen: true, date: "04-15 ~ 04-22" },
    { week: 3, classOpen: true, date: "04-15 ~ 04-22" },
    { week: 4, classOpen: true, date: "04-15 ~ 04-22" },
    { week: 5, classOpen: true, date: "04-15 ~ 04-22" },
    { week: 6, classOpen: false, date: "04-15 ~ 04-22" },
    { week: 7, classOpen: false, date: "04-15 ~ 04-22" },
    { week: 8, classOpen: false, date: "04-15 ~ 04-22" },
  ];
  return (
    <div className="teacher-main-container">
      <h2>{location.state.class}</h2>
      {lesson.map((x) => {
        return (
          <div className="class-box">
            <Link
              to={{
                pathname:
                  "/teacher-dashboard/" + location.state.class + "/" + x.week,
                state: {
                  class: location.state.class,
                  week: x.week,
                },
              }}
            >
              <h3>{x.week}주차</h3>
              <h4>{x.date}</h4>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default AsTeacherMain;
