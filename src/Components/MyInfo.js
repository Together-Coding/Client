import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import "../styles/myInfo.scss";
import { API_URL } from "../constants.js";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { api } from "../utils/http";

function MyInfo() {
  const [myInfo, setMyInfo] = useState("");
  const [myClass, setMyClass] = useState([]);

  useEffect(() => {
    api
      .all([
        api.get(`${API_URL}/api/user`),
        api.get(`${API_URL}/api/course/teacher`),
        api.get(`${API_URL}/api/course/student`),
      ])
      .then(
        api.spread((res1, res2, res3) => {
          setMyInfo(res1.data);
          setMyClass(res2.data);
          setParticipantClass(res3.data);
        })
      );
  }, []);

  let history = useHistory();

  useEffect(() => {
    let unlisten = history.listen((location) => {
      if (history.action == "POP") {
        history.push("/");
      }
    });
    return () => {
      unlisten();
    };
  }, [history]);

  const [participantClass, setParticipantClass] = useState([]);
  // 모달창 열고 닫기 컨트롤
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [addBtnMouseOver, setaddBtnMouseOver] = useState();

  const [courseName, setCourseName] = useState("");
  const [coursePwd, setCoursePwd] = useState("");
  const [courseDescription, setCourseDescription] = useState("");


  const courseNameEvent = (e) => {
    setCourseName(e.target.value);
  };
  const coursePwdEvent = (e) => {
    setCoursePwd(e.target.value);
  };
  const courseDesEvent = (e) => {
    setCourseDescription(e.target.value);
  };
  // 강의 추가 함수
  const submitEvent = (e) => {
    if (window.confirm(courseName + " 수업을 등록하시겠습니까?")) {
      e.preventDefault();

      let body = {
        name: courseName,
        password: coursePwd,
        description: courseDescription,
      };
      api.post(`${API_URL}/api/course`, body).then((res) => {
        if (res.status === 200) {
          alert("수업 등록 완료");
        }
      });
      setModalIsOpen(false);
      setCourseName("");
      setCoursePwd("");
      setCourseDescription("");
      window.location.reload();
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
            <span className="user-name">{myInfo.email}</span>
          </Link>
          <span>{myInfo.name}</span>
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
          {myClass &&
            myClass.map((x, idx) => {
              return (
                <div className="myinfo-class-box">
                  <div className="des-left">
                    <Link
                      to={{
                        pathname: "/teacher/" + x.courseId,
                        state: {
                          class: x.name,
                          description: x.description,
                          asTeacher: x.role,
                        },
                      }}
                    >
                      {x.name}
                    </Link>
                    <span>{x.description}</span>
                    {/*<span>마지막 수업 {x.last_lesson.substring(0, 10)}</span>*/}
                  </div>
                  {/*
                <div className="des-right">
                  <span>{x.lesson_num}개 수업</span>
                  <span>{x.student_num}명 참여</span>
                  </div>*/}
                </div>
              );
            })}
        </div>
        <div className="student">
          <p>참여 중인 강의</p>
          {participantClass &&
            participantClass.map((x, idx) => {
              return (
                <div className="myinfo-class-box">
                  <div className="des-left">
                    <Link
                      to={{
                        pathname: "/student/" + x.courseId,
                        state: {
                          class: x.name,
                          description: x.description,
                          asTeacher: x.role,
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
            <label>코스 설명</label>
            <input
              value={courseDescription}
              onChange={courseDesEvent}
              required
            />
            <button className="add-class-btn1">강의 개설</button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default MyInfo;
