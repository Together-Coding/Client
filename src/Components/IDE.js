import React from "react";
import { useState } from "react";
import "../styles/IDE.scss";
import Editor from "@monaco-editor/react";
import {
  faBriefcase,
  faKeyboard,
  faCodeBranch,
  faBug,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function IDE() {
  let examples = {
    javascript: 'console.log("hello javascript")',
    c: '#include <stdio.h>\nint main(int argc, char* argv[])\n{\n    printf("Hello World");\n    return 0;\n}\n',
    python: 'print("hello python")',
  };
  let [sidebarBtn, setSidebarBtn] = useState("프로젝트");
  let [editorReady, setEditerReady] = useState(false);
  let [user, setUser] = useState("권순용");
  let [file, setFile] = useState(false);
  function handleEditorDidMount() {
    setEditerReady(true);
  }
  const clickHandler = (e) => {
    setSidebarBtn(e.currentTarget.value);
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
          <a>도움말</a>
          <span className="user">{user}</span>
        </div>
        <div className="second-nav">
          <span>workspace / test / src / main. c</span>{" "}
          <div className="second-toolbar">
            <button>저장</button>
            <button>다른 이름으로 저장</button>
            <button>검색</button>
            <div className="toolbar-divider"> </div>
            <button>more.....</button>
          </div>
        </div>
      </div>
      {/*-------------side bar--------------*/}
      <div className="main">
        <div className="side-bar">
          <div className="side-btn">
            <button value="프로젝트" onClick={clickHandler}>
              <FontAwesomeIcon icon={faBriefcase} />
            </button>
            <span>프로젝트</span>
            <button value="명령어" onClick={clickHandler}>
              <FontAwesomeIcon icon={faKeyboard} />
            </button>
            <span>명령어</span>

            <button onClick={clickHandler} value="git">
              <FontAwesomeIcon icon={faCodeBranch} />
            </button>
            <span>git</span>

            <button onClick={clickHandler} value="디버그">
              <FontAwesomeIcon icon={faBug} />
            </button>
            <span>디버그</span>
          </div>
        </div>
        {sidebarBtn === "프로젝트" ? (
          <SideExplorer setFile={setFile} file={file} />
        ) : null}
        {sidebarBtn === "명령어" ? (
          <SideExplorer2 setFile={setFile} file={file} />
        ) : null}
        {sidebarBtn === "git" ? (
          <SideExplorer3 setFile={setFile} file={file} />
        ) : null}
        {sidebarBtn === "디버그" ? (
          <SideExplorer4 setFile={setFile} file={file} />
        ) : null}
        {/*-----------code input and terminal-----------*/}
        <div className="terminal">
          <Editor
            width="1559px"
            height="700px"
            theme="vs-dark"
            defaultLanguage="c"
            defaultValue={examples["c"]}
            editorDidMount={handleEditorDidMount}
          />
          <div className="bottom-bar">
            <span>터미널</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function SideExplorer(props) {
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <span>프로젝트</span>
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
}

export default IDE;
