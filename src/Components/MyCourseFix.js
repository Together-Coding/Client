import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/MyCourseFix.scss";
import { API_URL } from "../constants.js";

function MyCourseFix() {
  let headers = {
    Authorization: "Bearer " + localStorage.getItem("access_token") || "",
  };

  let location = useLocation();
  const courseId = location.state.courseId;

  let [teacherEmail, setTeacherEmail] = useState("");
  let [coursePwd, setCoursePwd] = useState("");

  const changeTeacherBtn = () => {
    if (teacherEmail === "") {
      alert("빈값을 입력하세요");
      return false;
    }
    let body = {
      courseId: courseId,
      teacherEmail: teacherEmail,
    };
    axios.put(`${API_URL}/course/teacher`, body, { headers }).then((res) => {
      if (res.status === 200) {
      }
    });
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
    axios.put(`${API_URL}/course/password`, body, { headers }).then((res) => {
      if (res.status === 200) {
          alert("변경 완료");
      }
    });
  };

  return (
    <div className="course-fix-container">
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
          type="password"
          onChange={(e) => {
            setCoursePwd(e.target.value);
          }}
        />
        <button onClick={changeCoursePwdBtn}>변경 하기</button>
      </div>
    </div>
  );
}

export default MyCourseFix;
