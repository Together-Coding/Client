import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/AsTeacherMain.scss";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../constants";
import {api} from "../utils/http";

function AsTeacherMain() {
  const location = useLocation();
  console.log(location);
  const history = useHistory();
  let courseID = useParams();
  const realCourseID = Number(courseID.id);

  let [courseInfo, setCourseInfo] = useState([]);
  let [lessonInfo, setLessonInfo] = useState([]);

  let fileUrl;
  // 수업정보, 레슨정보 가져오기
  useEffect(() => {
    const getCourseInfo = async () => {
      const courseInfo = await api.get(`${API_URL}/api/course/${realCourseID}`);
      setCourseInfo(courseInfo.data);
    };
    getCourseInfo();
  }, []);

  useEffect(() => {
    const getLessonInfo = async () => {
      const lessonInfo = await api.get(`${API_URL}/api/lesson/${realCourseID}`);
      setLessonInfo(lessonInfo.data);
    };
    getLessonInfo();
  }, []);
  /*
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
      .catch((e) => {
        console.log(e);
      });
  }, []);
*/
  const [Lang, setLang] = useState([]);
  console.log(courseInfo);
  console.log(lessonInfo);

  // 사용 가능 언어 get 요청
  useEffect(() => {
    api
      .get("https://dev-bridge.together-coding.com/api/runtimes/available")
      .then((res) => {
        setLang(res.data.image);
      });
  }, []);

  let availableLang = Lang.filter((val) => val.available === true);

  // 참여자 등록
  const addStudentBtn = () => {
    let body = {
      courseId: realCourseID,
      emails: participants,
    };
    if (window.confirm("참여자를 등록하시겠습니까?")) {
      api
        .post(`${API_URL}/api/course/student`, body)
        .then((res) => {
          if (res.status === 200) {
            alert("등록 완료");
          }
        });
      setAddStuIsOpen(false);
      setParticipants([]);
      window.location.reload();
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
  let [addlessonLang, setLessonLang] = useState();

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
      api
        .delete(`${API_URL}/api/course/${realCourseID}`)
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
  // 레슨 등록
  const addLessonBtn = () => {
    if (
      addlessonName === "" ||
      addlessonDes === "" ||
      addlessonLang === "none"
    ) {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      name: addlessonName,
      description: addlessonDes,
      courseId: realCourseID,
      lang_image_id: Number(addlessonLang),
    };
    console.log(body);
    if (window.confirm(addlessonName + " 수업을 등록하시겠습니까?")) {
      api.post(`${API_URL}/api/lesson`, body).then((res) => {
        if (res.status === 200) {
          alert("레슨 등록 완료!");
        }
      });
      setLessonName("");
      setLessonDes("");
      setModalIsOpen(false);
      window.location.reload();
    } else {
      return false;
    }
  };
  //레슨 이름 변경 모달 컨트롤
  const changeLessonNameInput = (e) => {
    setChangeLessonName(e.target.value);
  };
  // 레슨 이름 변경
  const changeLessonNameBtn = () => {
    let body = { name: changeLessonName };
    console.log(body);
    api
      .put(`${API_URL}/api/lesson/name/${saveLessonID}`, body)
      .then((res) => {
        if (res.status === 200) {
          alert("변경 완료");
          setModalChangeLessonName(false);
          setChangeLessonName("");
          window.location.reload();
        }
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
    api
      .put(`${API_URL}/api/lesson/description/${saveLessonID}`, body)
      .then((res) => {
        if (res.status === 200) {
          alert("변경 완료");
          setModalChangeLessonDes(false);
          setChangeLessonDes("");
          window.location.reload();
        }
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
      api
        .delete(`${API_URL}/api/lesson/${lessonID}`)
        .then((res) => {
          if (res.status === 200) {
            alert("레슨 삭제 완료");
            window.location.reload();
          }
        });
    } else {
      return false;
    }
    console.log(`${API_URL}/api/lesson/${lessonID}`);
  };
  // 템플릿 업로드
  const templateUploadCtrl = (e) => {
    if (e.target.files) {
      const formData = new FormData();
      const uploadFile = e.target.files[0];

      formData.append("file", uploadFile);

      let body = {
        courseId: realCourseID,
        lessonId: lessonIdforFile,
      };

      const val = JSON.stringify(body);
      const blob = new Blob([val], { type: "application/json" });
      formData.append("uploadDTO", blob);
      //디버그용 for문
      for (let value of formData.values()) {
        console.log(value);
      }
      api
        .post(`${API_URL}/api/file`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.status === 200) {
            window.location.reload();
          } else {
            alert("예상치 못한 오류가 발생하였습니다. 관리자에게 문의 하세요");
            return false;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };
  let [lessonIdforFile, setLessonIdforFile] = useState(0);
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
          {courseInfo.name} <span>({courseInfo.description})</span>
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
            <Link
              to={{
                pathname: "/changeInfo",
                state: { courseId: realCourseID },
              }}
            >
              <button>코스 수정</button>
            </Link>
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
            {lessonInfo.length === 0 ? (
              <h1 style={{ color: "gray" }}>수업을 추가해주세요!</h1>
            ) : null}
            {lessonInfo &&
              lessonInfo.map((x) => {
                return (
                  <div key={x.lessonId} className="class-box-teacher">
                    <div className="class-box-nav-teacher">
                      <p>
                        <Link
                          to={{
                            pathname:
                              "/course/" +
                              realCourseID +
                              "/lesson/" +
                              x.lessonId,
                            state: {
                              class: x.name,
                              classDes: x.description,
                              classId: realCourseID,
                              lessonId: x.lessonId,
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
                            setLessonID(x.lessonId);
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
                            setLessonID(x.lessonId);
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
                              name={x.lessonId}
                              onClick={() => setLessonIdforFile(x.lessonId)}
                            >
                              템플릿 업로드
                            </label>
                            <input
                              type="file"
                              name={x.lessonId}
                              id="file-upload"
                              style={{ display: "none" }}
                              accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
                              onChange={templateUploadCtrl}
                            />
                          </form>
                          {x.fileUrl !== null ? (
                            <button
                              className="template-btn"
                              value={x.fileUrl}
                              onClick={(e) => {
                                api
                                  .post(
                                    `${API_URL}/api/file/url`,
                                    {
                                      fileUrl: x.fileUrl,
                                      lessonId: x.lessonId,
                                    },
                                  )
                                  .then((res) => {
                                    if (res.status === 200) {
                                      fileUrl = res.data;
                                    } else {
                                      alert(
                                        "예상치 못한 오류가 발생하였습니다. 관리자에게 문의 하세요"
                                      );
                                      return false;
                                    }
                                  })
                                  .then(() => {
                                    window.open(fileUrl);
                                  });
                              }}
                            >
                              템플릿 다운로드
                            </button>
                          ) : null}

                          <button
                            value={x.lessonId}
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
                  <div key={item.userId} className="stu-boxs">
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
              <label>사용 언어</label>
              <select onChange={addLessonLangSelect}>
                <option value="none"></option>
                {availableLang &&
                  availableLang.map((x, idx) => {
                    return (
                      <>
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      </>
                    );
                  })}
              </select>

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
                {participants.map((item, idx) => (
                  <>
                    <span key={idx}>{item} | </span>
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
