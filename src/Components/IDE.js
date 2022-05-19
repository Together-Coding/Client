import React, { useEffect, useRef } from "react";
import { useState } from "react";
import "../styles/IDE.scss";
import Editor from "@monaco-editor/react";
import {
  faWindowMaximize,
  faFolderOpen,
  faChalkboardUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Terminal } from "./Terminal";
import { useLocation } from "react-router-dom";
import TeacherDashBoard from "./TeacherDashBoard";
import StudentDashBoard from "./StudentDashBoard";

import io from "socket.io-client";
/*
const socket = io("https://ide-ws.together-coding.com/", {
  auth: {
    Authorization: "Bearer " + localStorage.getItem("access_token"),
  },
});
*/
function IDE() {
  let location = useLocation();
  //console.log(socket);

  let [sidebarBtn, setSidebarBtn] = useState("IDE");
  let [dirBtn, setDirBtn] = useState(false);

  let [user, setUser] = useState("권순용");

  const [socketResponse, setSocketResponse] = useState("");

  const monacoRef = useRef();

  let [codeValue, setCodeValue] = useState(
    '#include <stdio.h>\nint main(int argc, char* argv[])\n{\n    printf("Hello World");\n    return 0;\n}\n'
  );

  // socket.io example
  /*useEffect(() => {
    socket.emit("INIT_LESSON", {
      courseId: 2,
      lessonId: 3,
    });
  }, []);
*/
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
  const DirBtnHandler = () => {
    setDirBtn(!dirBtn);
  };
  let codeSet;
  const saveCodeBtn = () => {
    console.log(monacoRef.current.setModel(null));
  };

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

            <button onClick={DirBtnHandler} value="디렉토리">
              <FontAwesomeIcon icon={faFolderOpen} />
            </button>
            <span>디렉토리</span>
          </div>
        </div>
        {/*-----------code input and terminal-----------*/}
        {dirBtn ? <SideExplorer /> : null}
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
        ) : location.state.asTeacher ? (
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
