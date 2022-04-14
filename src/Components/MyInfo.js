import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/myInfo.scss";

let mockData = {
  id: 1,
  name: "권순용",
  classAsStudent: ["자료구조", "객체지향프로그래밍2"],
  classAsTeacher: ["알고리즘"],
};

function MyInfo() {
  console.log(mockData);
  return (
    <div>
      <div className="Info-nav-bar">
        {mockData.name} 님 안녕하세요 <button>로그아웃</button>
      </div>
      <div className="main-box">
        <div className="teacher">
          <p>내가 교수자인 수업</p>
          {mockData.classAsTeacher.map((x, idx) => {
            return (
              <span className="class">
                <Link
                  to={{
                    pathname: "/teacher-dashboard/" + x,
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
                    pathname: "/student-dashboard/" + x,
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
    </div>
  );
}

export default MyInfo;
