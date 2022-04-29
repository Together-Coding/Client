import React, { useState } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import "../styles/myInfo.scss";
import axios from "axios";

let mockData = {
  id: 1,
  name: "권순용",
  classAsStudent: ["자료구조", "객체지향프로그래밍2"],
  classAsTeacher: ["알고리즘", "인터넷 프로그래밍", "통계학"],
};

function MyInfo() {
  console.log(mockData);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [coursePwd, setCoursePwd] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [participants, setParticipants] = useState([]);

  let [participantsInput, setParticipantsInput] = useState("");
  const courseNameEvent = (e) => {
    setCourseName(e.target.value);
  };
  const coursePwdEvent = (e) => {
    setCoursePwd(e.target.value);
  };
  const teacherEmailEvent = (e) => {
    setTeacherEmail(e.target.value);
  };
  const courseDesEvent = (e) => {
    setCourseDescription(e.target.value);
  };

  const submitEvent = (e) => {
    e.preventDefault();

    let body = {
      name: courseName,
      password: coursePwd,
      teacherName: teacherEmail,
      description: courseDescription,
      participant: participants,
    };
    axios.post(`$/api/course`, body).then((res) => {});
    /* 수업 개설 성공시
    if(body){
      alert("수업 개설 완료");
    }
    */
  };

  const inputPlus = () => {
    if (participantsInput === "") {
      alert("참여자 이메일을 입력하세요!");
      return false;
    }
    if (window.confirm(participantsInput + "를 등록하시겠습니까?")) {
      let participantsCopy = [...participants];
      participantsCopy.push(participantsInput);
      setParticipants(participantsCopy);
      setParticipantsInput("");
    } else {
      return false;
    }
  };
  console.log(participants);

  return (
    <div>
      <div className="Info-nav-bar">
        {mockData.name} 님 안녕하세요 <button>로그아웃</button>
      </div>
      <button onClick={() => setModalIsOpen(true)}>수업 개설</button>
      <div className="main-box">
        <div className="teacher">
          <p>내가 교수자인 수업</p>
          {mockData.classAsTeacher.map((x, idx) => {
            return (
              <span className="class">
                <Link
                  to={{
                    pathname: "/teacher-main/" + x,
                    state: {
                      class: x,
                    },
                  }}
                >
                  {x}
                </Link>
              </span>
            );
          })}
        </div>
        <div className="student">
          <p>내가 학생인 수업</p>
          {mockData.classAsStudent.map((x, idx) => {
            return (
              <span className="class">
                <Link
                  to={{
                    pathname: "/student-main/" + x,
                    state: {
                      class: x,
                    },
                  }}
                >
                  {x}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
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
        <div className="modal-nav">
          <button onClick={() => setModalIsOpen(false)}>X</button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={submitEvent}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label>수업 이름</label>
            <input value={courseName} onChange={courseNameEvent}></input>
            <label>수업 비밀번호</label>
            <input
              type="password"
              value={coursePwd}
              onChange={coursePwdEvent}
            />
            <label>강사 이메일</label>
            <input
              type="email"
              value={teacherEmail}
              onChange={teacherEmailEvent}
            />
            <label>코스 설명</label>
            <input value={courseDescription} onChange={courseDesEvent} />
            <label>
              참여자 이메일 <button onClick={inputPlus}>추가</button>
            </label>
            <input
              value={participantsInput}
              onChange={(e) => {
                setParticipantsInput(e.target.value);
              }}
            />
            <button>수업 개설</button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default MyInfo;
