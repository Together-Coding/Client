import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsStudentMain.scss";

function AsStudentMain() {
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
  const mockUpParticipants = [
    {
      userId: 102,
      email: "teacher2@naver.com",
      name: "teacher2",
    },
    {
      userId: 11,
      email: "student11@naver.com",
      name: "student11",
    },
    {
      userId: 12,
      email: "student12@naver.com",
      name: "student12",
    },
    {
      userId: 13,
      email: "student13@naver.com",
      name: "student13",
    },
    {
      userId: 14,
      email: "student14@naver.com",
      name: "student14",
    },
    {
      userId: 15,
      email: "student15@naver.com",
      name: "student15",
    },
  ];

  return (
    <div style={{ marginRight: 30, marginLeft: 30 }}>
      <h2 className="stu-main-nav">{location.state.class} <span style={{fontSize:15, color:"gray"}}>({location.state.description})</span></h2>
      <div className="student-main-container">
        <div className="class-box-contain">
          {lesson.map((x) => {
            return (
              <div className="class-box-stu">
                <Link
                  to={{
                    pathname:
                      "/student-dashboard/" +
                      location.state.class +
                      "/" +
                      x.week +
                      "week",
                    state: {
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

        <div className="class-participants-box">
          <p>참여자 목록</p>
          {mockUpParticipants.map((x) => {
            return (
              <div className="stu-boxs">
                <span style={{ fontWeight: "bold", fontSize: 20 }}>
                  {x.name}
                </span>
                <span style={{ color: "gray", fontSize: 13 }}>{x.email}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AsStudentMain;
