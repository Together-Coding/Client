import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsTeacherMain.scss";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";

function AsTeacherMain() {
  const location = useLocation();
  const courseID = useParams();
  console.log(courseID.id);
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

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addStuIsOpen, setAddStuIsOpen] = useState(false);
  return (
    <div style={{ marginRight: 30, marginLeft: 30 }}>
      <h2 className="teacher-main-nav">
        {location.state.class} <span>({location.state.description})</span>
      </h2>
      <button className="add-class-btn" onClick={() => setModalIsOpen(true)}>
        수업 추가
      </button>
      <div className="teacher-main-container">
        <div className="class-box-contain">
          {lesson.map((x) => {
            return (
              <div className="class-box-teacher">
                <div className="class-box-nav-teacher">
                  <Link
                    to={{
                      pathname:
                        "/course/" + courseID.id + "/lesson/" + x.lessonId,
                      state: {
                        class: location.state.class,
                        week: x.week,
                        lessonId: x.lessonId,
                      },
                    }}
                  >
                    <h3>
                      {x.week}주차<span>{x.date}</span>
                    </h3>
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
        </div>
        <div className="class-participants-box">
          <p>
            참여자 목록{" "}
            <button onClick={() => setAddStuIsOpen(true)}>
              <FontAwesomeIcon icon={faCirclePlus} />
            </button>
          </p>
          {mockUpParticipants.map((item) => {
            return (
              <div className="stu-boxs">
                <span style={{ fontWeight: "bold", fontSize: 20 }}>
                  {item.name}
                </span>
                <span style={{ color: "gray", fontSize: 13 }}>
                  {item.email}
                </span>
              </div>
            );
          })}
        </div>
        {/*수업 추가 모달-----------*/}
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
            <p>수업 추가 TODO</p>
          </div>
        </Modal>
        {/*참여자 추가 모달-----------*/}
        <Modal
          isOpen={addStuIsOpen}
          onRequestClose={() => setAddStuIsOpen(false)}
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
            <p>참여자 추가 TODO</p>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AsTeacherMain;
