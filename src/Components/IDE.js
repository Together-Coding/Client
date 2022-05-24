import React, { useEffect, useRef } from "react";
import { useState } from "react";
import "../styles/IDE.scss";
import Editor from "@monaco-editor/react";
import {
  faWindowMaximize,
  faFolderOpen,
  faChalkboardUser,
  faPeopleArrowsLeftRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Terminal } from "./Terminal";
import { useLocation } from "react-router-dom";
import TeacherDashBoard from "./TeacherDashBoard";
import StudentDashBoard from "./StudentDashBoard";
import { WSClient } from "../utils/websocket";

import io from "socket.io-client";

function IDE() {
  let location = useLocation();
  const courseId = location.state.classId;
  const lessonId = location.state.lessonId;

  let activeStu;
  let notActiveStu;

  let [stuInfo, setStuInfo] = useState([]);

  activeStu = stuInfo.filter(
    (item) => item.project !== null && item.project.active === true
  );
  notActiveStu = stuInfo.filter(
    (item) => item.project === null || item.project.active === false
  );

  // socket.io example
  useEffect(() => {
    runSocket(courseId, lessonId);
  }, []);

  let [sidebarBtn, setSidebarBtn] = useState("IDE");
  let [sidebarBtn2, setSidebarBtn2] = useState("");

  let [user, setUser] = useState("권순용");

  const [socketResponse, setSocketResponse] = useState("");

  const monacoRef = useRef();

  let [codeValue, setCodeValue] = useState(
    '#include <stdio.h>\nint main(int argc, char* argv[])\n{\n    printf("Hello World");\n    return 0;\n}\n'
  );

  const editorDidMount = (editor, monaco) => {
    monacoRef.current = editor;
  };
  //현재 라인, 코드 보여줌
  function handleEditorChange(value, e) {
    console.log(value);
    setCodeValue(value);
    console.log(monacoRef.current.getPosition());
  }
  const clickHandler = (e) => {
    setSidebarBtn(e.currentTarget.value);
  };
  const stuAndDirBtnHandler = (e) => {
    setSidebarBtn2(e.currentTarget.value);
  };
  let codeSet;
  const saveCodeBtn = () => {
    console.log(monacoRef.current.setModel(null));
  };

  const subsEvents = (socket) => {
    socket.on("INIT_LESSON", (data) => {
      console.log(data);
    });
    socket.on("ALL_PARTICIPANT", (args) => {
      setStuInfo(args);
    });
  };

  const runSocket = (courseID, lessonID) => {
    let socket = io("https://ide-ws.together-coding.com/", {
      auth: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });

    subsEvents(socket);

    socket.on("connect", () => {
      console.log("connected");

      socket.emit("INIT_LESSON", {
        courseId: courseID,
        lessonId: lessonID,
      });
      socket.emit("ALL_PARTICIPANT");
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  };

  console.log(stuInfo);

  return (
    <div>
      {/*--------------navbar--------------*/}
      <div className="container"></div>
      <div className="nav-bar">
        <div className="first-nav">
          <p>Together Coding</p>
          <a>파일</a>
          <a>편집</a>
          <a>프로젝트</a>
          <a>디버그</a>
          <a>컨테이너</a>
          <a>Git</a>
          <a>배포</a>
          <a>창</a>
          <button onClick={saveCodeBtn}>코드 저장</button>
          <span className="user">{user}</span>
        </div>
        <div className="second-nav">
          <span>
            {location.state.class} / {location.state.name}
          </span>{" "}
          {/*
          <div className="second-toolbar">
            <button>저장</button>
            <button>다른 이름으로 저장</button>
            <button>검색</button>
            <div className="toolbar-divider"> </div>
            <button>more.....</button>
          </div>
  */}
        </div>
      </div>
      {/*-------------side bar--------------*/}
      <div className="main">
        <div className="side-bar">
          <div className="side-btn">
            <button value="IDE" onClick={clickHandler}>
              <FontAwesomeIcon icon={faWindowMaximize} />
            </button>
            <span>IDE</span>
            <button value="대쉬보드" onClick={clickHandler}>
              <FontAwesomeIcon icon={faChalkboardUser} />
            </button>
            <span>대쉬보드</span>

            <button value="디렉토리" onClick={stuAndDirBtnHandler}>
              <FontAwesomeIcon icon={faFolderOpen} />
            </button>
            <span>디렉토리</span>

            <button value="학생" onClick={stuAndDirBtnHandler}>
              <FontAwesomeIcon icon={faPeopleArrowsLeftRight} />
            </button>
            <span>학생 현황</span>
          </div>
        </div>
        {/*-----------code input and terminal-----------*/}
        {sidebarBtn2 === "디렉토리" ? (
          <SideExplorer />
        ) : (
          <SideExplorer2 activeStu={activeStu} notActiveStu={notActiveStu} />
        )}
        {sidebarBtn === "IDE" ? (
          <div className="terminal">
            <div className="editor">
              <Editor
                height="70vh"
                theme="vs-dark"
                defaultLanguage="c"
                defaultValue={codeValue}
                onChange={handleEditorChange}
                onMount={editorDidMount}
                keepCurrentModel={true}
              />
            </div>
            <Terminal />
          </div>
        ) : location.state.asTeacher === "teacher" ? (
          <TeacherDashBoard />
        ) : (
          <StudentDashBoard />
        )}
      </div>
    </div>
  );
}

function SideExplorer() {
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <span>디렉토리</span>
      </p>
    </div>
  );
}
function SideExplorer2({ activeStu, notActiveStu }) {
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <div className="online-stu"></div>
        <span>온라인</span>
      </p>
      {activeStu &&
        activeStu.map((item) => {
          return (
            <div className="stu-list">
              <span>{item.nickname}</span>
            </div>
          );
        })}
      <p className="side-navbar">
        <div className="offline-stu"></div>
        <span>오프라인</span>
      </p>
      {notActiveStu &&
        notActiveStu.map((item) => {
          return (
            <div className="stu-list">
              <span>{item.nickname}</span>
            </div>
          );
        })}
    </div>
  );
}
/*
}
function SideExplorer2(props) {
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <span>명령어</span>
      </p>
      <div
        className="files"
        onClick={() => {
          props.setFile(!props.file);
        }}
      >
        test2
      </div>
      {props.file ? <div className="files"> &gt; 파일들</div> : null}
    </div>
  );
}
function SideExplorer3(props) {
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <span>git</span>
      </p>
      <div style={{ color: "#b9c3dd" }}>연결된 저장소가 없습니다</div>
    </div>
  );
}
function SideExplorer4(props) {
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <span>디버그</span>
      </p>
      <div
        className="files"
        onClick={() => {
          props.setFile(!props.file);
        }}
      >
        조사식
      </div>
      {props.file ? <div className="files"> &gt; 파일들</div> : null}
    </div>
  );
}*/

export default IDE;
