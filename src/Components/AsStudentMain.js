import React from "react";
import { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsStudentMain.scss";

function AsStudentMain() {
  const location = useLocation();
  const history = useHistory();
  const courseID = useParams();
  console.log(location);
  const lesson = [
    { lessonId: 1, week: 1, classOpen: true, date: "04-15 ~ 04-22" },
    { lessonId: 2, week: 2, classOpen: true, date: "04-15 ~ 04-22" },
    { lessonId: 3, week: 3, classOpen: true, date: "04-15 ~ 04-22" },
    { lessonId: 4, week: 4, classOpen: true, date: "04-15 ~ 04-22" },
    { lessonId: 5, week: 5, classOpen: true, date: "04-15 ~ 04-22" },
    { lessonId: 6, week: 6, classOpen: false, date: "04-15 ~ 04-22" },
    { lessonId: 7, week: 7, classOpen: false, date: "04-15 ~ 04-22" },
    { lessonId: 8, week: 8, classOpen: false, date: "04-15 ~ 04-22" },
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

  const logoutBtn = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      history.push("/");
    } else {
      return false;
    }
  };

  return (
    <>
      <div className="stu-main-nav">
        <div>
          {location.state.class} <span>({location.state.description})</span>
        </div>
        <button onClick={logoutBtn}>로그아웃</button>
      </div>
      <div style={{ marginRight: 30, marginLeft: 30 }}>
        <div className="student-main-container">
          <div className="class-box-contain">
            {lesson.map((x) => {
              return (
                <div className="class-box-stu">
                  <div className="stu-class-box-nav">
                    <Link
                      to={{
                        pathname:
                          "/course/" + courseID.id + "/lesson/" + x.lessonId,
                        state: {
                          class: location.state.class,
                          week: x.week,
                        },
                      }}
                    >
                      <p>{x.week}주차</p>
                      <span>{x.date}</span>
                    </Link>
                  </div>
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
    </>
  );
}

export default AsStudentMain;
