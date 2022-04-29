import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsTeacherMain.scss";
import Modal from "react-modal";

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

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div className="teacher-main-container">
      <h2>
        {location.state.class}{" "}
        <button onClick={() => setModalIsOpen(true)}>참여자 목록</button>
      </h2>
      {lesson.map((x) => {
        return (
          <div className="class-box">
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 15, 15, 0.79)",
          },
          content: {
            position: "absolute",
            top: "60px",
            left: "35%",
            width: "30%",
            height: "80%",
            border: "1px solid #ccc",
            background: "#fff",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
          },
        }}
      >
        <div>
          <h2>참여자 목록</h2>
          {mockUpParticipants.map((x) => (
            <div className="class-participants">
              <p>{x.name}</p>
              <span>{x.email}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default AsStudentMain;
