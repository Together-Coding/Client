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
    asTeacher: true,
  },
  {
    id: 2,
    name: "시스템 분석",
    description: "뭐하는지 모르겠는 과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    asTeacher: true,
  },
  {
    id: 3,
    name: "자료구조",
    description: "좋은과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    asTeacher: true,
  },
  {
    id: 4,
    name: "알고리즘",
    description: "재밌는 과목",
    lesson_num: 14,
    student_num: 32,
    last_lesson: "2016-10-27T17:13:40+00:00",
    asTeacher: true,
  },
];

let mockPartpaticipantClass = [
  {
    id: 5,
    name: "기계학습",
    description: "재밌는 과목",
    asTeacher: false,
  },
  {
    id: 6,
    name: "인공지능",
    description: "재밌는 과목",
    asTeacher: false,
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
  // 모달창 열고 닫기 컨트롤
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [addBtnMouseOver, setaddBtnMouseOver] = useState();

  const [courseName, setCourseName] = useState("");
  const [coursePwd, setCoursePwd] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  // 참가자 저장 state
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
  // 강의 추가 함수
  const submitEvent = (e) => {
    if (window.confirm(courseName + " 수업을 등록하시겠습니까?")) {
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
      setModalIsOpen(false);
    } else {
      return false;
    }
  };
  // 참여자 추가 모달 내의 참여자 추가 함수
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
  // 로그아웃 컨트롤: 토큰 지워주기
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
        <p>
          <Link to="/">Together Coding</Link>
        </p>
        <div>
          <Link to="/fix-info">
            <span className="user-name">{userEmail}</span>
          </Link>
          <button onClick={logOutCtrl}>로그아웃</button>
        </div>
      </div>
      <div className="main-box">
        <div className="teacher">
          <p>
            <span>나의 강의</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button
                onClick={() => setModalIsOpen(true)}
                onMouseOver={() => setaddBtnMouseOver(true)}
                onMouseOut={() => setaddBtnMouseOver(false)}
              >
                <FontAwesomeIcon icon={faCirclePlus} />
              </button>
              {addBtnMouseOver ? (
                <span style={{ fontSize: 10 }}>강의 개설</span>
              ) : null}
            </div>
          </p>
          {mockmyClass.map((x, idx) => {
            return (
              <div className="myinfo-class-box">
                <div className="des-left">
                  <Link
                    to={{
                      pathname: "/teacher/" + x.id,
                      state: {
                        class: x.name,
                        description: x.description,
                        asTeacher: x.asTeacher,
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
                      pathname: "/student/" + x.id,
                      state: {
                        class: x.name,
                        description: x.description,
                        asTeacher: x.asTeacher,
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
            top: "40px",
            left: "15%",
            width: "65%",
            height: "90%",
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
        <div className="add-class-modal">
          <h3>강의 개설</h3>
          <form
            onSubmit={submitEvent}
            style={{ display: "flex", flexDirection: "column" }}
            className="add-class-form"
          >
            <label>강의 이름</label>
            <input
              value={courseName}
              onChange={courseNameEvent}
              required
            ></input>
            <label>강의 비밀번호</label>
            <input
              type="password"
              value={coursePwd}
              onChange={coursePwdEvent}
              required
            />
            <label>강사 이메일</label>
            <input
              type="email"
              value={teacherEmail}
              onChange={teacherEmailEvent}
              required
            />
            <label>코스 설명</label>
            <input
              value={courseDescription}
              onChange={courseDesEvent}
              required
            />
            <label>
              참여자 이메일{" "}
              <button className="add-stu-btn" type="button" onClick={inputPlus}>
                추가
              </button>
            </label>
            <input
              value={participantsInput}
              onChange={(e) => {
                setParticipantsInput(e.target.value);
              }}
            />
            <div className="stu-to-be-add">
              <p>등록할 학생</p>
              {participants.map((item) => (
                <>
                  <span>{item} | </span>
                </>
              ))}
            </div>
            <button className="add-class-btn1">강의 개설</button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default MyInfo;
