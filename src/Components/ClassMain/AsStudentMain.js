import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { API_URL } from "../../constants";
import "../../styles/AsStudentMain.scss";
import { api } from "../../utils/http";

function AsStudentMain() {
  const location = useLocation();
  const history = useHistory();
  const courseID = useParams();
  const realCourseID = Number(courseID.id);

  let [courseInfo, setCourseInfo] = useState([]);
  let [lessonInfo, setLessonInfo] = useState([]);

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

  const logoutBtn = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      history.push("/");
    } else {
      return false;
    }
  };

  return (
    <>
      <div className="stu-main-nav">
        <div>
          {location.state.class} <span>({location.state.description})</span>
        </div>
        <button onClick={logoutBtn}>로그아웃</button>
      </div>
      <div style={{ marginRight: 30, marginLeft: 30 }}>
        <div className="student-main-container">
          <div className="class-box-contain">
            {lessonInfo &&
              lessonInfo.map((x) => {
                return (
                  <div className="class-box-stu">
                    <div className="stu-class-box-nav">
                      <Link
                        to={{
                          pathname:
                            "/course/" + x.courseId + "/lesson/" + x.lessonId,
                          state: {
                            class: x.name,
                            classDes: x.description,
                            classId: realCourseID,
                            lessonId: x.lessonId,
                            asTeacher: location.state.asTeacher,
                          },
                        }}
                      >
                        <p>{x.name}</p>
                        <span>{x.description}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="class-participants-box">
            <p>참여자 목록</p>
            <div className="stu-boxs">
              <span style={{ fontWeight: "bold", fontSize: 20 }}>
                {courseInfo.participants && courseInfo.participants[0].name} (
                <span style={{ color: "#0d6efd" }}>교수자</span>)
              </span>

              <span style={{ color: "gray", fontSize: 13 }}>
                {courseInfo.participants && courseInfo.participants[0].email}
              </span>
            </div>
            {courseInfo.participants &&
              courseInfo.participants.slice(1).map((x) => {
                return (
                  <div className="stu-boxs">
                    <span style={{ fontWeight: "bold", fontSize: 20 }}>
                      {x.name}
                    </span>
                    <span style={{ color: "gray", fontSize: 13 }}>
                      {x.email}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default AsStudentMain;
