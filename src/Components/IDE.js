import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import "../styles/IDE.scss";
import Editor from "@monaco-editor/react";
import {
  faWindowMaximize,
  faFolderOpen,
  faChalkboardUser,
  faPeopleArrowsLeftRight,
  faSquarePlus,
  faFileArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Terminal } from "./Terminal";
import { isObject, uuidv4 } from "../utils/etc";
import { useLocation } from "react-router-dom";
import TeacherDashBoard from "./TeacherDashBoard";
import StudentDashBoard from "./StudentDashBoard";

import io from "socket.io-client";
import {API_URL, WS_MONITOR} from "../constants";

const IDE = () => {
  let location = useLocation();
  let courseId = useRef(location.state ? location.state.classId : 0);
  let lessonId = useRef(location.state ? location.state.lessonId : 0);
  let className_ = useRef(location.state ? location.state.class : '');
  let classDesc = useRef(location.state ? location.state.classDes : '');

  let [userFile, setUserFile] = useState([]);
  const [userId, setUserId] = useState(0);

  let [stuInfo, setStuInfo] = useState([]);
  let [saveFileName, setSaveFileName] = useState("");

  let [initLineNum, setInitLineNum] = useState(0);
  let [initCursor, setInitCursor] = useState(0);
  let files = [
    { folder: [{ folder2: ["hihi.txt"] }, "empty_file.txt", "inner file.txt"] },
    "user16.txt",
    "reagjjjd.md",
  ];

  let files2 = [
    "folder/empty_file.txt",
    "folder/inner file.txt",
    "user16.txt",
    "reagjjjd.md",
    "folder/folder2/hi.txt",
  ];

  let newArr=files2.reduce((res,path)=>{
    let convertArr=path.split("/")
    let parent=res;
    let treePath=convertArr.forEach(ele=>{
      let temParent=parent.find(el=>el.path===ele)
      if(!temParent){
        let tmp={path:ele, children:[]}
        parent.push(tmp);
        parent=tmp.children
      }else{
        parent=temParent.children
      }
    })
    return res
  },[])

  console.log(files);

  useEffect(() => {
    if (location.state == null) {
      let m = location.pathname.match(/^\/course\/(\d+)\/lesson\/(\d+).*/)
      courseId.current = parseInt(m[1]);
      lessonId.current = parseInt(m[2]);
    }

    runSocket();
    console.log("render");
  }, []);

  let [sidebarBtn, setSidebarBtn] = useState("IDE");
  let [sidebarBtn2, setSidebarBtn2] = useState("");

  let [AddFileToggle, setAddFileToggle] = useState(false);

  const [socketResponse, setSocketResponse] = useState("");

  const monacoRef = useRef();
  const socketio = useRef();

  let [codeValue, setCodeValue] = useState("");
  let [codeLang, setCodeLang] = useState("");

  let [realTimeCode, setRealTimeCode] = useState([]);

  let [inputToggle, setInputToggle] = useState(false);
  let [fileTarget, setFileTarget] = useState("");

  let [renameCode, setRenameCode] = useState("");
  let [createFile, setCreateFile] = useState("");

  let [outFocus, setOutFocus] = useState(false);

  let [readForTeacherId, setReadForTeacherId] = useState(0);

  const editorDidMount = (editor, monaco) => {
    monacoRef.current = editor;
  };
  console.log(codeValue);

  //현재 라인, 코드 보여줌
  function handleEditorChange(value, e) {
    setOutFocus((prev) => {
      return false;
    });
    setCodeValue(value);

    let lineNum = monacoRef.current.getPosition().lineNumber;
    let colNum = monacoRef.current.getPosition().column;
    let fullLine = monacoRef.current.getSelection().endLineNumber;

    realTimeCodeSend(e, lineNum, colNum);

    console.log(lineNum, colNum, fullLine);

    socketio.current.emit("CURSOR_MOVE", {
      fileInfo: {
        ownerId: userId, // 파일 소유자 ID
        file: saveFileName, // 현재 보고있는 파일
        line: fullLine, // 전체 라인 수
        cursor: lineNum + "." + colNum, // Line 10의 2번째 글짜 ~ Line 11의 10번째 글자
      },
      event: "", // 파일을 열었을 때에만 `open` 으로 전송. 이외에는 필요 없음
      timestamp: Date.now(),
    });
  }

  const realTimeCodeSend = (e, lineNum, colNum) => {
    let inputStr;
    let inputTime = Date.now();
    if (e.changes[0].text === "") {
      inputStr = 8;
    } else {
      inputStr = e.changes[0].text.charCodeAt(0);
    }

    let copy = [...realTimeCode];
    copy.push(inputStr);
    setRealTimeCode(copy);

    setTimeout(() => {
      socketio.current.emit("FILE_MOD", {
        ownerId: userId,
        file: saveFileName,
        cursor: lineNum + "." + colNum,
        change: realTimeCode,
        timestamp: inputTime,
      });
    }, 1000);
    console.log(realTimeCode);
  };

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
  /**
   * 파일명이 _ 인 경우는 유저에게 보여주지 않는다.
   */
  const filterOutFile = (filename) => {
    return !filename.endsWith("_");
  };

  const filterFile = (args) => {
    setUserFile((userFile) => {
      if (args && args.file) {
        let filterData = args.file
          .map((i) => decodeURIComponent(window.atob(i)))
          .filter(filterOutFile);

        filterData.sort((a, b) => {
          a.toString();
          b.toString();
          return a.localeCompare(b);
        });
        return [...filterData];
      }
      return userFile;
    });
  };

  const fileSaveBtn = () => {
    socketio.current.emit("FILE_SAVE", {
      ownerId: userId,
      file: saveFileName,
      content: codeValue,
    });
  };

  const subsCommonEvents = (socket) => {
    socket.on("connect", () => {
      console.log("connected");

      // INIT_LESSON 에서 수업 정보를 구독하면, 나의 참여 ID 를 받음
      socket.emit("INIT_LESSON", {
        courseId: courseId.current,
        lessonId: lessonId.current,
      });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  };

  const emitEventsOnInit = (socket, _userId = null) => {
    socket.emit("ALL_PARTICIPANT");

    socket.emit("PROJECT_ACCESSIBLE");

    getDirectory(socket, _userId);
  };

  let subsEvents = (socket) => {
    socket.on("INIT_LESSON", (data) => {
      console.log(data);
      // 수업 정보 저장
      className_.current = data.lesson.name;
      classDesc.current = data.lesson.description;

      // 유저 정보 저장
      let _userId = data.ptcId;
      saveUserInfo(data);

      // IDE 데이터 요청
      emitEventsOnInit(socket, data.ptcId);
    });

    socket.on("ALL_PARTICIPANT", (args) => {
      console.log(args);
      if (args.participants) return setStuInfo(args.participants);
      setStuInfo(args); // 호환성 유지를 위함
    });

    socket.on("PARTICIPANT_STATUS", (args) => {
      console.log(args);
      setStuInfo((stuInfo) => {
        if (stuInfo.length > 0) {
          let copy = [...stuInfo];
          let findIndex = copy.findIndex((i) => i.id === args.id);
          if (findIndex !== -1) {
            copy[findIndex] = { ...copy[findIndex], active: args.active };
          }
          return [...copy];
        }
        return stuInfo;
      });
    });

    socket.on("PROJECT_ACCESSIBLE", (data) => {
      console.log(data);
    });

    socket.on("DIR_INFO", (args) => {
      if (args.error) {
        alert(args.error[0]);
        return false;
      }
      console.log(args);
      filterFile(args);
    });

    socket.on("FILE_READ", (data) => {
      saveCode(data);
    });
    socket.on("FILE_CREATE", (data) => {
      console.log(data);
      if (data) {
        setCreateFile("");
        setAddFileToggle(false);

        setUserFile((userFile) => {
          if (userFile.length > 0) {
            console.log(userFile);
            let copy = [...userFile];
            copy.push(data.name);
            return [...copy];
          }
          return userFile;
        });
      }
    });
    socket.on("FILE_DELETE", (data) => {
      console.log(data);
      if (data) {
        setUserFile((userFile) => {
          if (userFile.length > 0) {
            console.log(userFile);
            let copy = [...userFile];
            let findIndex = copy.findIndex((i) => i === data.name);
            if (findIndex !== -1) {
              copy.splice(findIndex, 1);
            }
            return [...copy];
          }
          return userFile;
        });
      }
    });

    socket.on("FILE_UPDATE", (data) => {
      setUserFile((userFile) => {
        if (userFile.length > 0) {
          console.log(userFile);
          let copy = [...userFile];
          let findIndex = copy.findIndex((i) => i === data.name);
          if (findIndex !== -1) {
            copy[findIndex] = data.rename;
          }
          console.log("#");
          return [...copy];
        }
        return userFile;
      });
    });
    socket.on("CURSOR_LAST", (args) => {
      console.log(args);
    });
    socket.on("CURSOR_MOVE", (args) => {
      console.log(args);
    });
    socket.on("FILE_SAVE", (args) => {
      console.log(args);
    });
    socket.on("FILE_MOD", (args) => {
      if (args.success === true) {
        setRealTimeCode([]);
      }
      console.log(args);
    });
  };

  const getDirectory = (socket, _userId = null) => {
    socket.emit("DIR_INFO", {
      targetId: _userId || userId,
    });
  };

  const runSocket = () => {
    socketio.current = io("https://ide-ws.together-coding.com/", {
      auth: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });

    // 서버측의 웹소켓 모니터링 지원
    if (WS_MONITOR) {
      const filter = ["connect", 'echo', 'TIMESTAMP_ACK', 'TIME_SYNC', 'TIME_SYNC_ACK']
      // Timestamp 값을 주입하여 emit 한다.
      const origEmit = socketio.current.emit;
      socketio.current.emit = (ev, data, ...args) => {
        // if (!filter.includes(ev)) return;
        if (data == null) data = {};
        if (isObject(data) && ev !== 'TIMESTAMP_ACK') {
          data['_ts_1'] = new Date().getTime();
          data['uuid'] = uuidv4();
        }
        return origEmit.call(socketio.current, ev, data, ...args)
      }

      const origOn = socketio.current.on;
      socketio.current.on = (ev, listener) => {
        return origOn.call(socketio.current, ev, (data = null) => {
          if (isObject(data) && data.hasOwnProperty('_ts_3')) {
            let _data = Object.assign({}, data)
            _data['_ts_4'] = new Date().getTime();
            socketio.current.emit('TIMESTAMP_ACK', _data);
          }
          return listener(data);
        })
      }

      socketio.current.on('connect', () => {
        socketio.current.emit('TIME_SYNC', {ts1: new Date().getTime()})
      })

      socketio.current.on('TIME_SYNC_ACK', (data) => {
        socketio.current.emit('TIME_SYNC_ACK', {...data, ts2: new Date().getTime()})
      })
    }

    subsCommonEvents(socketio.current);
    subsEvents(socketio.current);

    clearTimeout(interval_1sec);
    interval_1sec = setInterval(() => {
      if (!timeout_activityPing) {
      timeout_activityPing = setTimeout(() => {
        socketio.current.emit('ACTIVITY_PING')
        clearTimeout(timeout_activityPing);
        timeout_activityPing = null;
      }, 1000 * 10)
      }
    }, 1000)
  };

  return (
    <div>
      {/*--------------navbar--------------*/}
      <div className="container"></div>
      <div className="nav-bar">
        <div className="first-nav">
          <p>Together Coding</p>
        </div>
        <div className="second-nav">
          <span>
            {className_.current} / {classDesc.current}
          </span>{" "}
          {saveFileName !== "" ? (
            <>
              <span
                style={{
                  marginLeft: "5%",
                  fontWeight: "bold",
                  color: "#757677",
                }}
              >
                {saveFileName}
              </span>
              <button className="file-save-btn" onClick={fileSaveBtn}>
                {" "}
                <FontAwesomeIcon icon={faFileArrowUp} />
              </button>
            </>
          ) : null}
        </div>
      </div>
      {/*-------------side bar--------------*/}
      <div className="main">
        <div
          className="side-bar"
          onClick={() => {
            setOutFocus((prev) => {
              return true;
            });
            console.log(outFocus);
          }}
        >
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
            <span>현황</span>
          </div>
        </div>
        {/*-----------code input and terminal-----------*/}
        {sidebarBtn2 === "디렉토리" ? (
          <div
            className="side-explorer"
            onClick={() => {
              setOutFocus((prev) => {
                return true;
              });
              console.log(outFocus);
            }}
          >
            <p
              className="side-navbar"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>내 파일</span>
              <button
                onClick={(e) => {
                  setAddFileToggle(!AddFileToggle);
                }}
              >
                <FontAwesomeIcon icon={faSquarePlus} />
              </button>
            </p>
            {AddFileToggle ? (
              <div className="add-file-input-container">
                <label>정확한 경로를 입력해주세요.</label>
                <div className="add-file-input-area">
                  <input
                    value={createFile}
                    spellCheck="false"
                    onChange={(e) => {
                      setCreateFile(e.target.value);
                    }}
                  />
                  <button
                    onClick={() => {
                      socketio.current.emit("FILE_CREATE", {
                        ownerId: userId,
                        type: "file",
                        name: createFile,
                      });
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : null}

            <div className="file-container">
              {userFile &&
                userFile.map((i, idx) => {
                  return (
                    <div className="file-bar">
                      <div className="files-btns" key={idx}>
                        <span
                          value={i}
                          onClick={() => {
                            console.log("before", saveFileName);
                            socketio.current.emit("FILE_READ", {
                              ownerId: userId,
                              file: i,
                            });
                            setSaveFileName(i);
                            socketio.current.emit("CURSOR_LAST", {
                              ownerId: userId,
                              file: i,
                            });
                            socketio.current.emit("CURSOR_LAST", {
                              ownerId: userId,
                              file: i,
                            });
                          }}
                        >
                          {i}
                        </span>
                        {}
                        <div>
                          <button
                            value={i}
                            onClick={(e) => {
                              setInputToggle(!inputToggle);
                              setFileTarget(e.currentTarget.value);
                              inputCtrl(i);
                            }}
                          >
                            {inputToggle && fileTarget === i
                              ? "Save"
                              : "Rename"}
                          </button>
                          <button
                            onClick={() => {
                              let filename;
                              if (i.includes("/")) {
                                let idx = i.lastIndexOf("/");
                                filename = i.substr(idx + 1);
                              } else {
                                filename = i;
                              }
                              if (
                                window.confirm(
                                  "정말 " + filename + "을 삭제하시겠습니까?"
                                )
                              ) {
                                socketio.current.emit("FILE_DELETE", {
                                  ownerId: userId,
                                  type: "file",
                                  name: i,
                                });
                              } else {
                                return false;
                              }
                            }}
                          >
                            X
                          </button>
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
            {stuInfo &&
              stuInfo.map((item, idx) => {
                if (item.active === true) {
                  return (
                    <div className="stu-list" key={idx}>
                      <span>{item.nickname}</span>
                      {item.is_teacher ? <span>(teacher)</span> : null}
                    </div>
                  );
                }
              })}
            <p className="side-navbar">
              <div className="offline-stu"></div>
              <span>오프라인</span>
            </p>
            {stuInfo &&
              stuInfo.map((item, idx) => {
                if (item.active === false) {
                  return (
                    <div className="stu-list" key={idx}>
                      <span className="off-line-stu-name">
                        {item.nickname}
                        {item.is_teacher ? <span>(teacher)</span> : null}
                      </span>
                    </div>
                  );
                }
              })}
          </div>
        )}
        {sidebarBtn === "IDE" ? (
          <div className="terminal">
            <div
              className="editor"
              onClick={() => {
                setOutFocus((prev) => {
                  return false;
                });
                console.log(outFocus);
              }}
            >
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
            <div
              onClick={() => {
                setOutFocus(true);
                console.log(outFocus);
              }}
            >
              <Terminal />
            </div>
          </div>
        ) : location.state.asTeacher === "teacher" ? (
          <TeacherDashBoard socketio={socketio} />
        ) : (
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h2>접근 권한이 없습니다.</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
/*
function SideExplorer({ userFile, socketio, userId }) {
  console.log(userFile)
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
        {userFile &&
          userFile.map((i, idx) => {
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
