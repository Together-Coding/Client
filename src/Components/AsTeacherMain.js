import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsTeacherMain.scss";
import Modal from "react-modal";

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
    <div style={{ marginRight: 30, marginLeft: 30 }}>
      <h2 className="teacher-main-nav">
        {location.state.class}{" "}
        <button onClick={() => setModalIsOpen(true)}>참여자 목록</button>
      </h2>
      <div className="teacher-main-container">
        {lesson.map((x) => {
          return (
            <div className="class-box">
              <div className="class-box-nav">
                <Link
                  to={{
                    pathname:
                      "/teacher-dashboard/" +
                      location.state.class +
                      "/" +
                      x.week +
                      "week",
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
              <div className="class-box-bottom">
                <p>세션 시간: </p>
                <p>학생수: </p>
                <p>질문수 :</p>
                <p>전체 피드백 수</p>

                <div style={{ borderTop: "1px solid gray" }}>
                  <p>과제 개수: </p>
                  <p>과제 완료 학생: </p>
                </div>
              </div>
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
    </div>
  );
}

export default AsTeacherMain;
