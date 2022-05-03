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
  const addStudentBtn = () => {
    if (addStu === "") {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      courseID: courseID.id,
      student: addStu,
    };
    if (window.confirm(addStu + " 학생을 등록하시겠습니까?")) {
      console.log(body);
      setAddStuIsOpen(false);
    } else {
      return false;
    }
  };

  const addLessonBtn = () => {
    if (addlessonName === "" || addlessonDes==="" || addlessonLang==="") {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      lessonName:addlessonName,
      lessonDes:addlessonDes,
      courseID: courseID.id,
      lang: addlessonLang,
    };
    if (window.confirm(addlessonName + " 수업을 등록하시겠습니까?")) {
      console.log(body);
      setModalIsOpen(false);
    } else {
      return false;
    }
  };
  
  // 참여자 추가 저장 state
  //let [addCourseID, setCourseID] = useState("");
  let [addStu, setAddStu] = useState("");

  const addStuInput = (e) => {
    setAddStu(e.target.value);
  };

  // 레슨 추가 저장 state
  let [addlessonName, setLessonName]=useState("")
  let [addlessonDes, setLessonDes]=useState("")
  let [addlessonLang, setLessonLang]=useState("")

  const addLessonInput=(e)=>{
    setLessonName(e.target.value);
  }
  const addlessonDesInput=(e)=>{
    setLessonDes(e.target.value);
  }
  const addLessonLangSelect=(e)=>{
    setLessonLang(e.target.value);
  }

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
                        asTeacher: location.state.asTeacher,
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
            <input required onChange={addLessonInput}/>
            <label>레슨 설명</label>
            <input required onChange={addlessonDesInput}/>
            <label>Course ID</label>
            <input value={courseID.id} readOnly/>
            <label>사용 언어</label>
            <select required onChange={addLessonLangSelect}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <button className="add-lesson-btn" onClick={addLessonBtn}>레슨 등록</button>
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
          <div className="add-stu-modal">
            <h3>참여자 추가</h3>
            <label>코스 ID</label>
            <input required value={courseID.id} readOnly/>
            <label>추가할 학생(이메일)</label>
            <input onChange={addStuInput} required />
            <button onClick={addStudentBtn}>추가 하기</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AsTeacherMain;
