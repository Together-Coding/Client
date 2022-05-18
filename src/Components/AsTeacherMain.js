import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsTeacherMain.scss";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_URL } from "../constants";

function AsTeacherMain() {
  let headers = {
    Authorization: "Bearer " + localStorage.getItem("access_token") || "",
  };

  const location = useLocation();
  const history = useHistory();
  let courseID = useParams();
  const realCourseID = Number(courseID.id);

  let [courseInfo, setCourseInfo] = useState([]);
  let [lessonInfo, setLessonInfo] = useState([]);

  // 수업정보, 레슨정보 가져오기
  useEffect(() => {
    axios
      .all([
        axios.get(`${API_URL}/api/course/${realCourseID}`, { headers }),
        axios.get(`${API_URL}/api/lesson/${realCourseID}`, { headers }),
      ])
      .then(
        axios.spread((res1, res2) => {
          setCourseInfo(res1.data);
          setLessonInfo(res2.data);
        })
      )
      .catch(() => {});
  }, []);

  const lesson = [
    {
      id: 102,
      name: "모두를 위한 프로그래밍: 파이썬",
      description: "Getting Started with Python",
    },
    {
      id: 104,
      name: "파이썬 자료구조",
      description: "Python Data Structures",
    },
    {
      id: 105,
      name: "파이썬을 이용한 웹 스크래핑",
      description: "Using Python to Access Web Data",
    },
    {
      id: 106,
      name: "파이썬을 이용한 데이터베이스 처리",
      description: "Using Databases With Python",
    },
  ];
  
  const [Lang, setLang] = useState([]);
  const [availableLang, setavailableLang] = useState([]);

  // 사용 가능 언어 get 요청
  useEffect(() => {
    axios
      .get("https://dev-bridge.together-coding.com/api/runtimes/available")
      .then((res) => {
        setLang(res.data.language);
      });
  }, []);
  console.log(Lang);
  // 참여자 등록
  const addStudentBtn = () => {
    let body = {
      courseId: realCourseID,
      emails: participants,
    };
    if (window.confirm("참여자를 등록하시겠습니까?")) {
      axios
        .post(`${API_URL}/api/course/student`, body, { headers })
        .then((res) => {
          if (res.status === 200) {
            alert("등록 완료");
          }
        });
      setAddStuIsOpen(false);
      setParticipants([]);
    } else {
      return false;
    }
  };
  // 레슨 등록
  const addLessonBtn = () => {
    if (addlessonName === "" || addlessonDes === "") {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      name: addlessonName,
      description: addlessonDes,
      courseId: realCourseID,
    };
    if (window.confirm(addlessonName + " 수업을 등록하시겠습니까?")) {
      axios
        .post(`${API_URL}/api/lesson/${realCourseID}`, body, { headers })
        .then((res) => {
          if (res.status === 200) {
            alert("레슨 등록 완료!");
          }
        });
      setLessonName("");
      setLessonDes("");
      setModalIsOpen(false);
    } else {
      return false;
    }
  };
  
  const [participants, setParticipants] = useState([]);
  let [participantsInput, setParticipantsInput] = useState("");

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addStuIsOpen, setAddStuIsOpen] = useState(false);

  const [modalchangeLessonName, setModalChangeLessonName] = useState(false);
  const [moadlchangeLessonDes, setModalChangeLessonDes] = useState(false);

  // 레슨 추가 저장 state
  let [addlessonName, setLessonName] = useState("");
  let [addlessonDes, setLessonDes] = useState("");
  let [addlessonLang, setLessonLang] = useState("");

  // 레슨 추가 모달 컨트롤
  const addLessonInput = (e) => {
    setLessonName(e.target.value);
  };
  const addlessonDesInput = (e) => {
    setLessonDes(e.target.value);
  };
  const addLessonLangSelect = (e) => {
    setLessonLang(e.target.value);
  };

  // 코스 삭제 컨트롤
  const closeClassBtn = () => {
    if (window.confirm("정말 코스를 종료 시키겠습니까?")) {
      axios
        .delete(`${API_URL}/api/course/${realCourseID}`, { headers })
        .then((res) => {
          if (res.status === 200) {
            alert("코스 종료 완료");
            history.goBack();
          }
        });
    } else {
      return false;
    }
  };

  let [changeLessonName, setChangeLessonName] = useState("");
  let [changeLessonDes, setChangeLessonDes] = useState("");

  let [saveLessonID, setLessonID] = useState("");
  //레슨 이름 변경 모달 컨트롤
  const changeLessonNameInput = (e) => {
    setChangeLessonName(e.target.value);
  };
  // 레슨 이름 변경
  const changeLessonNameBtn = () => {
    let body = { name: changeLessonName };
    console.log(body);
    axios
      .put(`${API_URL}/api/lesson/name/${saveLessonID}`, body)
      .then((res) => {
        console.log(res);
      });
  };
  // 레슨 설명 변경 모달 컨트롤
  const changeLessonDesInput = (e) => {
    setChangeLessonDes(e.target.value);
  };
  // 레슨 설명 변경
  const changeLessonDesBtn = () => {
    let body = { description: changeLessonDes };
    console.log(body);
    axios
      .put(`${API_URL}/api/lesson/description/${saveLessonID}`, body)
      .then((res) => {
        console.log(res);
      });
  };
  // 로그아웃
  const logoutBtn = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      history.push("/");
    } else {
      return false;
    }
  };
  //레슨 삭제 컨트롤
  const delLessonBtn = (e) => {
    let lessonID = e.target.value;
    if (window.confirm("해당 레슨을 정말 종료 시키겠습니까?")) {
      axios.delete(`${API_URL}/api/lesson/${lessonID}`).then((res) => {
        console.log(res);
      });
    } else {
      return false;
    }
    console.log(`${API_URL}/api/lesson/${lessonID}`);
  };
  // 템플릿 업로드
  const templateUploadCtrl = (e) => {
    e.preventDefault();

    if (e.target.files) {
      const uploadFile = e.target.files[0];
      const formData = new FormData();
      formData.append("files", uploadFile);
      //디버깅용 for문
      for (let value of formData.values()) {
        console.log(value);
      }

      axios.post(`${API_URL}/`, formData).then((res) => {
        console.log(res);
      });
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

  return (
    <>
      <div className="teacher-main-nav">
        <div>
          {location.state.class} <span>({location.state.description})</span>
        </div>
        <button onClick={logoutBtn}>로그아웃</button>
      </div>
      <div style={{ marginRight: 30, marginLeft: 30 }}>
        <div className="teacher-main-btn-box">
          <button
            className="add-class-btn"
            onClick={() => setModalIsOpen(true)}
          >
            수업 추가
          </button>
          <div className="class-fix-btn">
            <button>코스 수정</button>
            <button
              className="close-class-btn"
              style={{ backgroundColor: "#6c757e" }}
              onClick={closeClassBtn}
            >
              코스 종료
            </button>
          </div>
        </div>
        <div className="teacher-main-container">
          <div className="class-box-contain">
            {lesson.map((x) => {
              return (
                <div className="class-box-teacher">
                  <div className="class-box-nav-teacher">
                    <p>
                      <Link
                        to={{
                          pathname:
                            "/course/" + courseID.id + "/lesson/" + x.id,
                          state: {
                            class: x.name,
                            classDes: x.description,
                            lessonId: x.id,
                            asTeacher: location.state.asTeacher,
                          },
                        }}
                      >
                        {x.name}
                      </Link>
                      <button
                        value={x.id}
                        onClick={() => {
                          setModalChangeLessonName(true);
                          setLessonID(x.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </p>{" "}
                    <span>
                      {x.description}{" "}
                      <button
                        value={x.id}
                        onClick={() => {
                          setModalChangeLessonDes(true);
                          setLessonID(x.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </span>
                  </div>
                  <div className="class-box-bottom">
                    <p>세션 시간: </p>
                    <p>학생수: </p>
                    <p>질문수 :</p>
                    <p>전체 피드백 수</p>

                    <div style={{ borderTop: "1px solid gray" }}>
                      <p>과제 개수: </p>
                      <p>과제 완료 학생: </p>
                      <div className="class-box-btns">
                        <form style={{ marginBottom: 5 }}>
                          <label
                            className="template-label"
                            htmlFor="file-upload"
                          >
                            템플릿 업로드
                          </label>
                          <input
                            type="file"
                            id="file-upload"
                            style={{ display: "none" }}
                            accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
                            onChange={templateUploadCtrl}
                          />
                        </form>
                        <button className="template-btn">
                          템플릿 다운로드
                        </button>
                        <button
                          value={x.id}
                          className="del-class-btn"
                          onClick={delLessonBtn}
                        >
                          레슨 삭제
                        </button>
                      </div>
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
            {courseInfo.participants &&
              courseInfo.participants.slice(1).map((item) => {
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
                top: "40px",
                left: "25%",
                width: "50%",
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
            <div className="add-lesson-modal">
              <h3>레슨 추가 하기</h3>
              <label>레슨 이름</label>
              <input required onChange={addLessonInput} />
              <label>레슨 설명</label>
              <input required onChange={addlessonDesInput} />
              <label>Course ID</label>
              <input value={realCourseID} readOnly />
              {/*
              <label>사용 언어</label>
              <select required onChange={addLessonLangSelect}>
                {Lang.map((x) => {
                  return (
                    <>
                      <option>{x.name}</option>
                    </>
                  );
                })}
              </select>
              */}
              <button className="add-lesson-btn" onClick={addLessonBtn}>
                레슨 등록
              </button>
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
                left: "20%",
                width: "60%",
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
            <div className="add-stu-modal">
              <h3>참여자 추가</h3>
              <label>코스 ID</label>
              <input required value={realCourseID} readOnly />
              <label>
                참여자 이메일{" "}
                <button
                  className="add-stu-btn"
                  type="button"
                  onClick={inputPlus}
                >
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
              <button onClick={addStudentBtn}>추가 하기</button>
            </div>
          </Modal>
          {/*레슨 이름 변경 모달*/}
          <Modal
            isOpen={modalchangeLessonName}
            onRequestClose={() => setModalChangeLessonName(false)}
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
                left: "35%",
                width: "30%",
                height: "50%",
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
            <div className="change-lesson-name-modal">
              <h3>레슨 이름 변경</h3>
              <label>변경할 이름</label>
              <input required onChange={changeLessonNameInput} />
              <button
                className="change-lesson-name-btn"
                onClick={changeLessonNameBtn}
              >
                변경
              </button>
            </div>
          </Modal>
          {/*레슨 설명 변경 모달*/}
          <Modal
            isOpen={moadlchangeLessonDes}
            onRequestClose={() => setModalChangeLessonDes(false)}
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
                left: "35%",
                width: "30%",
                height: "50%",
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
            <div className="change-lesson-des-modal">
              <h3>레슨 설명 변경</h3>
              <label>변경할 설명</label>
              <input required onChange={changeLessonDesInput} />
              <button
                className="change-lesson-des-btn"
                onClick={changeLessonDesBtn}
              >
                변경
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
}

export default AsTeacherMain;
