import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import "../../styles/MyCourseFix.scss";
import { API_URL } from "../../constants.js";
import { api } from "../../utils/http";

function MyCourseFix() {
  let history = useHistory();

  let location = useLocation();
  const courseId = location.state.courseId;
  const [courseInfo, setCourseInfo] = useState([]);

  useEffect(() => {
    api.get(`${API_URL}/api/course/${courseId}`).then((res) => {
      setCourseInfo(res.data);
    });
  }, []);

  let [teacherEmail, setTeacherEmail] = useState("");
  let [coursePwd, setCoursePwd] = useState("");

  let [newCourseName, setNewCourseName] = useState("");
  let [newCourseDes, setNewCourseDes] = useState("");

  const changeTeacherBtn = () => {
    if (teacherEmail === "") {
      alert("빈값을 입력하세요");
      return false;
    }

    if (window.confirm("정말 강사를 변경 하시겠습니까?")) {
      let body = {
        courseId: courseId,
        teacherEmail: teacherEmail,
      };
      api.put(`${API_URL}/api/course/teacher`, body).then((res) => {
        if (res.status === 200) {
          alert(
            "강사가 정상적으로 변경 되었습니다.\n내 강의 정보 화면으로 돌아갑니다."
          );
          history.push("/me");
        }
      });
    } else {
      return false;
    }
  };

  const changeCoursePwdBtn = () => {
    if (coursePwd === "") {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      courseId: courseId,
      password: coursePwd,
    };
    api.put(`${API_URL}/api/course/password`, body).then((res) => {
      if (res.status === 200) {
        alert("변경 완료");
        setCoursePwd("");
      }
    });
  };

  const changeCourseInfoBtn = () => {
    if (newCourseName === "" || newCourseDes === "") {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      name: newCourseName,
      description: newCourseDes,
    };
    api.put(`${API_URL}/api/course/${courseId}`, body).then((res) => {
      if (res.status === 200) {
        alert("변경 완료");
        window.location.reload();
        setNewCourseName("");
        setNewCourseDes("");
      }
    });
  };

  return (
    <>
      <div className="fix-course-main-nav">
        {courseInfo.name} <span>({courseInfo.description})</span>
      </div>
      <div className="course-fix-container">
        <div className="change-course-box">
          <label>코스 이름 수정</label>
          <input
            type="text"
            value={newCourseName}
            onChange={(e) => {
              setNewCourseName(e.target.value);
            }}
          />
          <label>코스 설명 수정</label>
          <input
            type="text"
            value={newCourseDes}
            onChange={(e) => {
              setNewCourseDes(e.target.value);
            }}
          />
          <button onClick={changeCourseInfoBtn}>변경하기</button>
        </div>
        <div className="change-teacher-box">
          <label>강사 변경</label>
          <input
            type="email"
            placeholder="변경할 강사의 이메일을 입력하세요"
            onChange={(e) => {
              setTeacherEmail(e.target.value);
            }}
          />
          <button onClick={changeTeacherBtn}>변경하기</button>
        </div>
        <div className="change-course-pwd-box">
          <label>코스 비밀번호 변경</label>
          <input
            value={coursePwd}
            type="password"
            onChange={(e) => {
              setCoursePwd(e.target.value);
            }}
          />
          <button onClick={changeCoursePwdBtn}>변경 하기</button>
        </div>
      </div>
    </>
  );
}

export default MyCourseFix;
