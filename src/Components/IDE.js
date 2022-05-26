import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import "../styles/IDE.scss";
import Editor from "@monaco-editor/react";
import {
  faWindowMaximize,
  faFolderOpen,
  faChalkboardUser,
  faPeopleArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Terminal } from "./Terminal";
import { useLocation } from "react-router-dom";
import TeacherDashBoard from "./TeacherDashBoard";
import StudentDashBoard from "./StudentDashBoard";

import io from "socket.io-client";

function IDE() {
  let location = useLocation();
  const courseId = location.state.classId;
  const lessonId = location.state.lessonId;

  let [userfile, setUserFile] = useState([]);
  // let userId;
  const [userId, setUserId] = useState(0);

  let activeStu;
  let notActiveStu;

  let [stuInfo, setStuInfo] = useState([]);

  activeStu = stuInfo.filter((item) => item.active === true);
  notActiveStu = stuInfo.filter((item) => item.active === false);

  // socket.io example
  useEffect(() => {
    runSocket();
    console.log("render");
    return ()=>{
      getDirectory(socketio.current)
    }
  }, [userId]);

  let [sidebarBtn, setSidebarBtn] = useState("IDE");
  let [sidebarBtn2, setSidebarBtn2] = useState("");

  const [socketResponse, setSocketResponse] = useState("");

  const monacoRef = useRef();
  const socketio = useRef();

  let [codeValue, setCodeValue] = useState("");
  let [codeLang, setCodeLang] = useState("");

  let [inputToggle, setInputToggle] = useState(false);
  let [fileTarget, setFileTarget] = useState("");

  let [renameCode, setRenameCode] = useState("");

  const editorDidMount = (editor, monaco) => {
    monacoRef.current = editor;
  };
  //현재 라인, 코드 보여줌
  function handleEditorChange(value, e) {
    console.log(value);
    let codeCopy=value
    setCodeValue(codeCopy);
    console.log(monacoRef.current.getPosition());
  }
  const clickHandler = (e) => {
    setSidebarBtn(e.currentTarget.value);
  };
  const stuAndDirBtnHandler = (e) => {
    setSidebarBtn2(e.currentTarget.value);
  };
  const saveCodeBtn = () => {
    console.log(monacoRef.current.setModel(null));
  };

  const inputCtrl = (file) => {
    if (inputToggle === true && renameCode !== "") {
      socketio.current.emit("FILE_UPDATE", {
        ownerId: userId,
        type: "file",
        name: file,
        rename: renameCode,
      });
    }
    setRenameCode("");
    socketio.current.on("FILE_UPDATE", (data) => {
      if (userfile.length > 0) {
        console.log(userfile);
        let copy = [...userfile];
        let findIndex = copy.findIndex((i) => i === data.name);
        if (findIndex !== -1) {
          copy[findIndex] = data.rename;
        }
        setUserFile([...copy])
      }
    });
  };

  const saveUserInfo = (data) => {
    setUserId((prev) => {
      return data.ptcId;
    });
  };
  // todo: 디렉토리 있을때 처리
  const saveCode = (data) => {
    console.log(data);
    if (data.file.slice(-1) === "c") {
      setCodeLang("c");
      setCodeValue((prev) => {
        return data.content;
      });
    } else if (data.file.slice(-2) === "py") {
      setCodeLang("python");
      setCodeValue((prev) => {
        return data.content;
      });
    } else if (data.file.slice(-2) === "js") {
      setCodeLang("javascript");
      setCodeValue((prev) => {
        return data.content;
      });
    } else if (data.file.slice(-2) === "md") {
      setCodeLang("markdown");
      setCodeValue((prev) => {
        return data.content;
      });
    } else {
      setCodeLang("plaintext");
      setCodeValue((prev) => {
        return data.content;
      });
    }
  };

  const filterFile = (args) => {
    if (args) {
      let filterData = args.file.map((i) => decodeURIComponent(window.atob(i)));
      setUserFile(filterData);
    }
  };

  const changeStuActive = (args) => {
    let findIndex = stuInfo.findIndex((i) => i.id === args.id);
    let copy = [...stuInfo];
    if (findIndex !== -1) {
      copy[findIndex] = { ...copy[findIndex], active: args.active };
    }
    setStuInfo({...copy});
  };

  const subsCommonEvents = (socket) => {
    socket.on("connect", () => {
      console.log("connected");

      // INIT_LESSON 에서 수업 정보를 구독하면, 나의 참여 ID 를 받음
      socket.emit("INIT_LESSON", {
        courseId: courseId,
        lessonId: lessonId,
      });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  };

  const emitEventsOnInit = (socket) => {
    socket.emit("ALL_PARTICIPANT");

    getDirectory(socket);
  };

  const subsEvents = (socket) => {
    socket.on("INIT_LESSON", (data) => {
      // 유저 정보 저장
      saveUserInfo(data);

      // IDE 데이터 요청
      emitEventsOnInit(socket);
    });
    

    socket.on("ALL_PARTICIPANT", (args) => {
      setStuInfo(args);
    });

    socket.on("PARTICIPANT_STATUS", (args) => {
      console.log(args);
      if (args) {
        changeStuActive(args);
      }
    });

    socket.on("ACTIVITY_PING");

    socket.on("DIR_INFO", (args) => {
      filterFile(args);
    });
    socket.on("FILE_READ", (data) => {
      saveCode(data);
    });
  };

  const getDirectory = (socket) => {
    socket.emit("DIR_INFO", {
      targetId: userId,
    });
    
  };

  const runSocket = () => {
    socketio.current = io("https://ide-ws.together-coding.com/", {
      auth: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });
    subsCommonEvents(socketio.current);
    subsEvents(socketio.current);
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
        </div>
        <div className="second-nav">
          <span>
            {location.state.class} / {location.state.classDes}
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
            <span>내 파일</span>

            <button value="학생" onClick={stuAndDirBtnHandler}>
              <FontAwesomeIcon icon={faPeopleArrowsLeftRight} />
            </button>
            <span>학생 현황</span>
          </div>
        </div>
        {/*-----------code input and terminal-----------*/}
        {sidebarBtn2 === "디렉토리" ? (
          <div className="side-explorer">
            <p className="side-navbar">
              <span>내 파일</span>
            </p>
            <div className="file-container">
              {userfile &&
                userfile.map((i, idx) => {
                  return (
                    <div className="file-bar" key={idx}>
                      <div className="files-btns">
                        <span
                          value={i}
                          onClick={() => {
                            socketio.current.emit("FILE_READ", {
                              ownerId: userId,
                              file: i,
                            });
                          }}
                        >
                          {i}
                        </span>
                        <div>
                          <button
                            value={i}
                            onClick={(e) => {
                              setInputToggle(!inputToggle);
                              setFileTarget(e.currentTarget.value);
                              inputCtrl(i);
                            }}
                          >
                            {inputToggle && fileTarget === i ? "저장" : "수정"}
                          </button>
                          <button>삭제</button>
                        </div>
                      </div>
                      {inputToggle && fileTarget === i ? (
                        <div className="input-file">
                          <input
                          defaultValue={i}
                            spellCheck="false"
                            onChange={(e) => {
                              setRenameCode(e.target.value);
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="side-explorer">
            <p className="side-navbar">
              <div className="online-stu"></div>
              <span>온라인</span>
            </p>
            {activeStu &&
              activeStu.map((item, idx) => {
                return (
                  <div className="stu-list" key={idx}>
                    <span>{item.nickname}</span>
                  </div>
                );
              })}
            <p className="side-navbar">
              <div className="offline-stu"></div>
              <span>오프라인</span>
            </p>
            {notActiveStu &&
              notActiveStu.map((item, idx) => {
                return (
                  <div className="stu-list" style={{ color: "grey" }} key={idx}>
                    <span>{item.nickname}</span>
                  </div>
                );
              })}
          </div>
        )}
        {sidebarBtn === "IDE" ? (
          <div className="terminal">
            <div className="editor">
              <Editor
                height="70vh"
                theme="vs-dark"
                language={codeLang}
                value={codeValue}
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
/*
function SideExplorer({ userfile, socketio, userId }) {
  console.log(userfile)
  let [inputToggle, setInputToggle] = useState(false);
  let [fileTarget, setFileTarget] = useState("");

  let [renameCode, setRenameCode] = useState("");

  const inputCtrl = (file) => {
    if (inputToggle === true && renameCode !== "") {
      socketio.current.emit("FILE_UPDATE", {
        ownerId: userId,
        type: "file",
        name: file,
        rename: renameCode,
      });
    }
    setRenameCode("");
  };
  return (
    <div className="side-explorer">
      <p className="side-navbar">
        <span>내 파일</span>
      </p>
      <div className="file-container">
        {userfile &&
          userfile.map((i, idx) => {
            return (
              <div className="file-bar" key={idx}>
                <div className="files-btns">
                  <span
                    value={i}
                    onClick={() => {
                      socketio.current.emit("FILE_READ", {
                        ownerId: userId,
                        file: i,
                      });
                    }}
                  >
                    {i}
                  </span>
                  <div>
                    <button
                      value={i}
                      onClick={(e) => {
                        setInputToggle(!inputToggle);
                        setFileTarget(e.currentTarget.value);
                        inputCtrl(i);
                      }}
                    >
                      {inputToggle && fileTarget === i ? "저장" : "수정"}
                    </button>
                    <button>삭제</button>
                  </div>
                </div>
                {inputToggle && fileTarget === i ? (
                  <div className="input-file">
                    <input
                      spellCheck="false"
                      onChange={(e) => {
                        setRenameCode(e.target.value);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
      </div>
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
        activeStu.map((item, idx) => {
          return (
            <div className="stu-list" key={idx}>
              <span>{item.nickname}</span>
            </div>
          );
        })}
      <p className="side-navbar">
        <div className="offline-stu"></div>
        <span>오프라인</span>
      </p>
      {notActiveStu &&
        notActiveStu.map((item, idx) => {
          return (
            <div className="stu-list" style={{ color: "grey" }} key={idx}>
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
