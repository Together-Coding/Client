import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import "../styles/IDE.scss";
import Editor, {KeyCode}  from "@monaco-editor/react";
import {
  faWindowMaximize,
  faFolderOpen,
  faChalkboardUser,
  faPeopleArrowsLeftRight,
  faSquarePlus,
  faFileArrowUp,
  faBookOpenReader,
  faWindowMinimize,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Terminal } from "./Terminal";
import { isObject, uuidv4 } from "../utils/etc";
import { useLocation } from "react-router-dom";
import TeacherDashBoard from "./TeacherDashBoard";
import io from "socket.io-client";
import { API_URL, WS_MONITOR, WS_URL } from "../constants";
import {resizeStartHandler, resizeEndHandler} from "../utils/etc"

/**
 * ``현황`` 탭에서 학생들 리스트를 보여줍니다.
 * @param {*} idx for loop key
 * @param {*} item 해당 유저 participant object
 * @param {*} acc 자신이 해당 유저에 대해 가지고 있는 권한
 * @param {*} accBy 해당 유저가 자신에 대해 가지고 있는 권한
 * @param {*} myId 자신의 ID
 * @param {*} showOtherDir 해당 유저의 디렉터리 보기 이벤트 핸들러
 * @param {*} togglePerm 자신에 대한 권한 수정
 * @returns
 */
const StudentList = (idx, item, acc, accBy, myId, showOtherDir, togglePerm) => {
  const hasProject = item.project;
  const permToIt = acc ? acc.permission : 0;
  const canRead = (permToIt & 4) == 4;
  const permToMe = accBy ? accBy.permission : 0;

  return (
    <div
      className={
        "stu-list" +
        (item.active ? "" : " off-line") +
        (hasProject && canRead ? " readable" : "")
      }
      key={idx}
    >
      <span className="stu-symbol">
        {item.is_teacher ? <FontAwesomeIcon icon={faBookOpenReader} /> : null}
      </span>
      <span>{item.nickname}</span>
      {myId == item.id ? null : (
        <div className="stu-toolbox">
          {hasProject && canRead ? (
            <span
              className="open"
              value={item.id}
              onClick={(e) => {
                showOtherDir(item);
              }}
            >
              <FontAwesomeIcon icon={faFolderOpen} />
            </span>
          ) : null}
          <span
            className={"perm read " + ((permToMe & 4) == 4 ? "active" : "")}
            onClick={(e) => togglePerm(item.id, permToMe, 4)}
          >
            R
          </span>
          <span
            className={"perm write " + ((permToMe & 2) == 2 ? "active" : "")}
            onClick={(e) => togglePerm(item.id, permToMe, 2)}
          >
            W
          </span>
          <span
            className={"perm exec " + ((permToMe & 1) == 1 ? "active" : "")}
            onClick={(e) => togglePerm(item.id, permToMe, 1)}
          >
            X
          </span>
        </div>
      )}
    </div>
  );
};

const IDE = () => {
  let blockRender = useRef({});
  
  let location = useLocation();
  let courseId = useRef(location.state ? location.state.classId : 0);
  let lessonId = useRef(location.state ? location.state.lessonId : 0);
  let className_ = useRef(location.state ? location.state.class : "");
  let classDesc = useRef(location.state ? location.state.classDes : "");

  const [initId, setInitId] = useState(0);

  let [userFile, setUserFile] = useState([]);
  const [myPtcId, setMyPtcId] = useState(0);
  const [userId, setUserId] = useState(0);
  let [userNickName, setUserNickName] = useState("나");

  let [stuInfo, setStuInfo] = useState({});
  let [saveFileName, setSaveFileName] = useState("");

  let [initLineNum, setInitLineNum] = useState(0);
  let [initCursor, setInitCursor] = useState(0);

  useEffect(() => {
    if (location.state == null) {
      let m = location.pathname.match(/^\/course\/(\d+)\/lesson\/(\d+).*/);
      courseId.current = parseInt(m[1]);
      lessonId.current = parseInt(m[2]);
    }
    localStorage.setItem("lessonId", lessonId.current); // FIXME: TerminalMenu.js 로의 상태 전송을 위한 임시 코드

    runSocket();
    console.log("render");

    // return () => {
    // socketio.current.removeAllListeners()
    // }
  }, []);

  useEffect(() => {
    localStorage.setItem("currUserId", userId);
  }, [userId]);

  useEffect(() => {
    localStorage.setItem("currFileName", saveFileName);
  }, [saveFileName]);

  useEffect(() => {
    localStorage.setItem("currMyPtcId", myPtcId);
  }, [myPtcId])

  let [sidebarBtn, setSidebarBtn] = useState("IDE");
  let [sidebarBtn2, setSidebarBtn2] = useState("");

  let [AddFileToggle, setAddFileToggle] = useState(false);

  const [socketResponse, setSocketResponse] = useState("");

  const monacoRef = useRef();
  const monacomonacoRef = useRef();
  const footerRef = useRef();
  const onFooterResize = useRef(); 
  let monacoPreventHandler = useRef(false);

  const socketio = useRef();

  const explorerStu = useRef();
  const explorerDirectory = useRef();

  let [codeValue, setCodeValue] = useState("");
  let [copyCodeVal, setCopyCodeVal] = useState("");
  let [codeLang, setCodeLang] = useState("");

  let [realTimeCode, setRealTimeCode] = useState([]);

  let [inputToggle, setInputToggle] = useState(false);
  let [fileTarget, setFileTarget] = useState("");

  let [renameCode, setRenameCode] = useState("");
  let [createFile, setCreateFile] = useState("");

  let [accessibleStu, setAccessibleStu] = useState({});
  let [accessedByStu, setAccessedByStu] = useState({});

  let [outFocus, setOutFocus] = useState(false);

  let [readForTeacherId, setReadForTeacherId] = useState(0);

  // 실시간 커서
  let [cursorMove, setCursorMove] = useState([]);
  let [currentLine, setCurrentLine] = useState(0);
  let [currentCol, setCurrentCol] = useState(0);

  let interval_1sec = null;
  let timeout_activityPing = null;

  const editorDidMount = (editor, monaco) => {
    monacoRef.current = editor;
    monacomonacoRef.current = monaco;
    editor.addAction({
      // An unique identifier of the contributed action.
      id: "my-id",

      // A label of the action that will be presented to the user.
      label: "",

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyCode.F8,
        // chord
      ],

      run: function (ed) {
        addQuestion(ed, monaco);
      },
    });
  };
  const addQuestion = (ed, monaco) => {
    let currentLine = ed.getPosition().lineNumber;
    let currentCol = ed.getPosition().column;

    console.log(currentLine, currentCol);

    ed.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(currentLine, 1, currentLine, 1),
          options: {
            linesDecorationsClassName: "myLineDecoration",
          },
        },
      ]
    );
  };

  // 특정 유저의 디렉터리 보여줌
  function showOtherDir(ptc) {
    console.log(ptc);
    setUserId(ptc.id);
    setUserNickName(ptc.nickname);
    setCodeValue("");

    socketio.current.emit("DIR_INFO", {
      targetId: ptc.id,
    });
    setSidebarBtn2("디렉토리");
  }

  //현재 라인, 코드 보여줌
  const handleEditorChange = (value, e) => {
    if (monacoPreventHandler.current == true) return;
    if (blockRender.current[value] != null) {
      blockRender.current[value] = null;
      return;
    }
    setOutFocus((prev) => {
      return false;
    });
    let codeVal = monacoRef.current.getValue();

    setCodeValue(codeVal);

    let lineNum = monacoRef.current.getPosition().lineNumber;
    let colNum = monacoRef.current.getPosition().column;
    let fullLine = monacoRef.current.getSelection().endLineNumber;

    realTimeCodeSend(e, lineNum, colNum);

    console.log(lineNum, colNum, fullLine);
    
    if (saveFileName !== null && saveFileName !== "") {
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

    const _saveFileName = localStorage.getItem('currFileName');
    setCodeValue((code) => {
      saveCodeDeferred(_saveFileName, code);
      return code;
    });
  };

  let modCodeTimeout = null;
  const modDelay = 1000;

  const realTimeCodeSend = (e, lineNum, colNum) => {
    let inputStr;
    let inputTime = Date.now();

    /**
     * e.changes[0]
     * .range
     *  endCOlumn
     *  endLineNumber
     *  startColumn
     *  startLineNumber
     * .rangeLength
     * .rangeOffset
     * .text
     */
    let copy = []
    for (let change of e.changes) {
      if (change.text === "") inputStr = 8;
      else inputStr = change.text;
      copy.push(inputStr);
    }
    if (copy.length <= 0) return; // 빈 정보는 전송하지 않음

    // FIXME: 테스트용 임시
    monacoRef.current.setPosition({lineNumber: 3, column: 3})  // col : 0부터, line : 1부터

    socketio.current.emit("FILE_MOD", {
      ownerId: userId,
      file: localStorage.getItem('currFileName'),
      cursor: lineNum + "." + colNum,
      change: copy,
      timestamp: inputTime,
    });
  };

  let saveCodeTimeout;
  const saveDelay = 500;

  function saveCodeDeferred(filename, content) {
    clearTimeout(saveCodeTimeout);
    saveCodeTimeout = setTimeout(() => {
      if (content.trim().length === 0) return; // fix bug

      socketio.current.emit("FILE_SAVE", {
        ownerId: userId,
        file: filename,
        content: content,
      });
    }, saveDelay);
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
  };

  const saveUserInfo = (data) => {
    setUserId((prev) => {
      return data.ptcId;
    });
  };

  const returnMyProject = (e) => {
    setUserId((prev) => {
      return e.target.value;
    });
    setSidebarBtn2("디렉토리");
    setUserNickName("나");
    socketio.current.emit("DIR_INFO", {
      targetId: myPtcId,
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
      setInitId((prev) => {
        return data.ptcId;
      });
      setMyPtcId(data.ptcId);
      saveUserInfo(data);

      // IDE 데이터 요청
      emitEventsOnInit(socket, data.ptcId);
    });

    socket.on("ALL_PARTICIPANT", (args) => {
      let allPtc = {};
      try {
        args.participants.forEach((item) => (allPtc[item.id] = item));
      } catch (e) {
        args.forEach((item) => (allPtc[item.id] = item));
      }
      setStuInfo(allPtc);
    });

    socket.on("PARTICIPANT_STATUS", (args) => {
      console.log(args);
      setStuInfo((stuInfo) => {
        stuInfo[args.id] = args;
        return Object.assign({}, stuInfo);
      });
    });

    socket.on("PROJECT_ACCESSIBLE", (data) => {
      let newAcc = {};
      console.log(data);
      data.accessible_to.forEach((item) => (newAcc[item.userId] = item));
      setAccessibleStu(newAcc);

      let newAccBy = {};
      data.accessed_by.forEach((item) => (newAccBy[item.userId] = item));
      setAccessedByStu(newAccBy);
    });

    socket.on("DIR_INFO", (args) => {
      if (args.error) {
        setUserFile([]);
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
      setCursorMove((prev) => {
        return args;
      });

      try {
        let lineInfo = args.fileInfo.cursor.split(".");
        setCurrentLine(lineInfo[0]);
        setCurrentCol(lineInfo[1]);
      } catch (e) {}
    });
    socket.on("FILE_SAVE", (args) => {
      // console.log(args);
    });
    socket.on("FILE_MOD", (args) => {
      const _myPtcId = parseInt(localStorage.getItem('currMyPtcId'))
      const _userId = parseInt(localStorage.getItem('currUserId'))
      const _saveFileName = localStorage.getItem('currFileName')

        // 자신이 수정한 것은 무시
        // 현재 보고있는 파일의 주인에 대한 것이 아니면 무시
        // 현재 보고있는 파일이 아니면 무시
        // 빈 응답은 무시
        if (
          args.ptcId === _myPtcId ||
          args.ownerId !== parseInt(_userId) || // 왜인지 몰라도, string 값임
          args.file !== _saveFileName ||
          (args.change && args.change.length <= 0)
        )
          return _saveFileName;

        console.log(args);
        let [lineNum, colNum] = args.cursor.split('.');
        console.log('Insert', lineNum, colNum)
        try {
          monacoPreventHandler.current = true;
          for (let c of args.change) {
            if (c == 8) {
              monacoRef.current.trigger(c, 'deleteLeft')
            } else { 
              monacoRef.current.trigger(null, 'type', {text: c});
            }

            //  monacoRef.current.executeEdits("FILE_MOD", [
            //   {
            //       range: new monacomonacoRef.current.Range(
            //         colNum+1, // end col
            //         lineNum+3, // end line
            //         colNum+1, // start col
            //         lineNum+2, // start line
            //       ),
            //     text: 'hello',
            //     forceMoveMarkers: true,
            //   },
            // ]);
          }
        } finally {
          monacoPreventHandler.current = false;
        }

        //let findLine = splitCode[cursorPostion[0] - 1];
        //console.log(findLine);
        //let newStr = findLine.substr(0, cursorPostion[1] - 1) + str;
        //console.log(newStr);

        //console.log(splitCode);
        //codeVal=codeVal+str;

        /*monacoRef.current.executeEdits("", [
          {
            range: {
              startLineNumber: cursorPostion[0],
              //startColumn: cursorPostion[1],
            // endLineNumber: cursorPostion[0],
              endColumn: cursorPostion[1],
            },
            text: str,
            forceMoveMarkers: true,
          },
        ]);*/
    });

    socket.on("PROJECT_PERM", (args) => {
      setAccessedByStu((prev) => {
        let copied = { ...prev };
        copied[args.userId].permission = args.permission;
        return copied;
      });
    });
  };

  const getDirectory = (socket, _userId = null) => {
    socket.emit("DIR_INFO", {
      targetId: _userId || userId,
    });
  };

  const togglePerm = (targetId, perm, target) => {
    if ((perm & target) == target) {
      // perm 존재 -> mask off
      perm = perm & (-1 - target);
    } else {
      // perm 없음 -> mask on
      perm = perm | target;
    }
    socketio.current.emit("PROJECT_PERM", [
      {
        targetId,
        permission: perm,
      },
    ]);
  };

  const runSocket = () => {
    socketio.current = io(WS_URL, {
      auth: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });

    // 서버측의 웹소켓 모니터링 지원
    if (WS_MONITOR) {
      const filter = [
        "connect",
        "echo",
        "TIMESTAMP_ACK",
        "TIME_SYNC",
        "TIME_SYNC_ACK",
      ];
      // Timestamp 값을 주입하여 emit 한다.
      const origEmit = socketio.current.emit;
      socketio.current.emit = (ev, data, ...args) => {
        // if (!filter.includes(ev)) return;
        if (data == null) data = {};
        if (isObject(data) && ev !== "TIMESTAMP_ACK") {
          data["_ts_1"] = new Date().getTime();
          data["uuid"] = uuidv4();
        }
        return origEmit.call(socketio.current, ev, data, ...args);
      };

      const origOn = socketio.current.on;
      socketio.current.on = (ev, listener) => {
        return origOn.call(socketio.current, ev, (data = null) => {
          if (isObject(data) && data.hasOwnProperty("_ts_3")) {
            let _data = Object.assign({}, data);
            _data["_ts_4"] = new Date().getTime();
            socketio.current.emit("TIMESTAMP_ACK", _data);
          }
          return listener(data);
        });
      };

      socketio.current.on("connect", () => {
        socketio.current.emit("TIME_SYNC", { ts1: new Date().getTime() });
      });

      socketio.current.on("TIME_SYNC_ACK", (data) => {
        socketio.current.emit("TIME_SYNC_ACK", {
          ...data,
          ts2: new Date().getTime(),
        });
      });
    }

    subsCommonEvents(socketio.current);
    subsEvents(socketio.current);

    clearTimeout(interval_1sec);
    interval_1sec = setInterval(() => {
      if (!timeout_activityPing) {
        timeout_activityPing = setTimeout(() => {
          socketio.current.emit("ACTIVITY_PING", { targetId: userId });
          clearTimeout(timeout_activityPing);
          timeout_activityPing = null;
        }, 1000 * 10);
      }
    }, 1000);
  };

  /**
   * 에디터 하단 터미널 resize 이벤트 리스터
   */
  const resizeEditorOnResizeFooter = () => {
    let rect = monacoRef.current._domElement.getBoundingClientRect()
    let newHeight = footerRef.current.getBoundingClientRect().top - rect.top
    monacoRef.current._domElement.style.height = newHeight + "px"
  }

  return (
    <div className="HOME-IDE" style={{ overflow: "hidden" }}>
      {/*--------------navbar--------------*/}
      <div className="container"></div>
      <div className="nav-bar">
        <div className="first-nav">
          <p>Together Coding</p>
          <button
            value={initId}
            className="return-my-project-btn"
            onClick={(e) => {
              returnMyProject(e);
            }}
          >
            내 프로젝트 불러오기
          </button>
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
          <div className="real-time-cursor-bar">
            {cursorMove.fileInfo && cursorMove.fileInfo ? (
              <>
                <div className="blink-dot" />
                <span>
                  {cursorMove.nickname}{" "}
                  <span className="cursor-file-name">
                    ({cursorMove.fileInfo.file})
                  </span>
                  입력중...{" "}
                </span>{" "}
                <span>
                  lineNum :{" "}
                  <span className="line-num">{currentLine && currentLine}</span>{" "}
                  colNum :{" "}
                  <span className="col-num">{currentCol && currentCol}</span>
                </span>
              </>
            ) : null}
          </div>
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
            <span>파일</span>

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
            ref={explorerDirectory}
          >
            <p
              className="side-navbar"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>{userNickName}의 프로젝트</span>
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
            <div
              className="resizer"
              onMouseDown={(e) => {
                document.onmousemove = resizeStartHandler(explorerDirectory);
                document.onmouseup = resizeEndHandler;
              }}
            ></div>
          </div>
        ) : (
          <div className="side-explorer" ref={explorerStu}>
            <p className="side-navbar">
              <div className="online-stu"></div>
              <span>온라인</span>
            </p>
            {stuInfo &&
              Object.entries(stuInfo).map(([ptcId, item], idx) => {
                if (item.active === true)
                  return StudentList(
                    idx,
                    item,
                    accessibleStu[item.id],
                    accessedByStu[item.id],
                    myPtcId,
                    showOtherDir,
                    togglePerm
                  );
              })}
            <p className="side-navbar offline-stus">
              <div className="offline-stu"></div>
              <span>오프라인</span>
            </p>
            {stuInfo &&
              Object.entries(stuInfo).map(([ptcId, item], idx) => {
                if (item.active === false)
                  return StudentList(
                    idx,
                    item,
                    accessibleStu[item.id],
                    accessedByStu[item.id],
                    myPtcId,
                    showOtherDir,
                    togglePerm
                  );
              })}
            <div
              className="resizer"
              onMouseDown={(e) => {
                document.onmousemove = resizeStartHandler(explorerStu);
                document.onmouseup = resizeEndHandler;
              }}
            ></div>
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
              }}
            >
              <Editor
                theme="vs-dark"
                language={codeLang}
                value={codeValue}
                onChange={handleEditorChange}
                onMount={editorDidMount}
                keepCurrentModel={true}
                onKeyPress={(e) => {
                  if (e.key === "enter") {
                    console.log("enter");
                  }
                }}
              />
            </div>
            <div className="relative">
              <Terminal 
                footerRef={footerRef}
                onClick={() => {
                  setOutFocus(true);
                }} onFooterResize={onFooterResize}>
                  <div className="resizer top" onMouseDown={(e) => {
                    document.onmousemove = resizeStartHandler(footerRef, true,
                       resizeEditorOnResizeFooter, onFooterResize.current);
                    document.onmouseup = resizeEndHandler;
                  }}/>
              </Terminal>
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
