import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import "../styles/myInfo.scss";
import axios from "axios";
import { API_URL } from "../constants.js";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
// api/course/teacher 에서 가져온 데이터
let mockmyClass = [
  {
    id: 1,
    name: "컴퓨터 공학 종합 설계",
    description: "팀플 과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    accessible: true,
    active: true,
  },
  {
    id: 2,
    name: "시스템 분석",
    description: "뭐하는지 모르겠는 과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    accessible: true,
    active: true,
  },
  {
    id: 3,
    name: "자료구조",
    description: "좋은과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    accessible: true,
    active: true,
  },
  {
    id: 4,
    name: "알고리즘",
    description: "재밌는 과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    accessible: true,
    active: true,
  },
];

let mockPartpaticipantClass = [
  {
    id: 5,
    name: "기계학습",
    description: "재밌는 과목"
  },
  {
    id: 6,
    name: "인공지능",
    description: "재밌는 과목"
  },
];

function MyInfo() {
  useEffect(() => {
    let body = {
      token: localStorage.getItem("access_token"),
    };
    axios.post(`${API_URL}/auth/token`, body).then((res) => {
      console.log(res);
      setEmail(res.data.email);
    });
  }, []);
  /* api 구축되면 확인해보기
  useEffect(() => {
    axios.all([
      axios.get(`${API_URL}/api/course/teacher`),
      axios.get(`${API_URL}/api/course/student`),
    ]).then((res1,res2)=>{
      setMyClass(res1);
      setParticipantClass(res2);
    })
  },[]);
  */
  //**********임시 회원정보 (이메일)
  const [userEmail, setEmail] = useState("");
  //***********************
  let history = useHistory();
  //*********임시 수업개설 완료 데이터
  const [수업개설, set수업개설] = useState([]);
  //********************

  // 내 강의, 참여중 강의 저장용
  const [myClass, setMyClass] = useState([]);
  const [participantClass, setParticipantClass] = useState([]);
  //
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
    let headers = {
      Authorization: "Bearer " + localStorage.getItem("access_token") || "",
    };
    let body = {
      name: courseName,
      password: coursePwd,
      teacherName: teacherEmail,
      description: courseDescription,
      participant: participants,
    };
    axios.post(`${API_URL}/api/course`, body, { headers }).then((res) => {
      console.log(res);
    });
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
  const logOutCtrl = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      history.push("/");
    } else {
      return false;
    }
  };

  return (
    <div>
      <div className="Info-nav-bar">
        <p>Together Coding</p>
        <div>
          <span>{userEmail} | </span>
          <button onClick={logOutCtrl}>로그아웃</button>
        </div>
      </div>
      <div className="main-box">
        <div className="teacher">
          <p>
            <span>나의 강의</span>
            <button onClick={() => setModalIsOpen(true)}>
              <FontAwesomeIcon icon={faCirclePlus} />
            </button>
          </p>
          {mockmyClass.map((x, idx) => {
            return (
              <div className="myinfo-class-box">
                <div className="des-left">
                  <Link
                    to={{
                      pathname: "/teacher-main/" + x.id,
                      state: {
                        class: x.name,
                        description:x.description
                      },
                    }}
                  >
                    {x.name}
                  </Link>
                  <span>{x.description}</span>
                  <span>마지막 수업 {x.last_lesson.substring(0, 10)}</span>
                </div>
                <div className="des-right">
                  <span>{x.lesson_num}개 수업</span>
                  <span>{x.student_num}명 참여</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="student">
          <p>참여 중인 강의</p>
          {mockPartpaticipantClass.map((x, idx) => {
            return (
              <div className="myinfo-class-box">
                <div className="des-left">
                  <Link
                    to={{
                      pathname: "/student-main/" + x.id,
                      state: {
                        class: x.name,
                        description:x.description
                      },
                    }}
                  >
                    {x.name}
                  </Link>
                  <span>description</span>
                  <span>마지막 수업</span>
                </div>
                <div className="des-right">
                  <span>개 수업</span>
                  <span>명 참여</span>
                </div>
              </div>
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
              참여자 이메일{" "}
              <button type="button" onClick={inputPlus}>
                추가
              </button>
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