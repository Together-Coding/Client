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
  faBookOpenReader,
  faArrowDown,
  faWindowMinimize,
  faSave,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Terminal } from "./Terminal";
import { isObject, uuidv4 } from "../utils/etc";
import { useLocation } from "react-router-dom";
import TeacherDashBoard from "./TeacherDashBoard";
import io from "socket.io-client";
import { API_URL, WS_MONITOR, WS_URL } from "../constants";
import Modal from "react-modal";
import { resizeStartHandler, resizeEndHandler } from "../utils/etc";

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
  const saveDelay = 500;
  let debounce_file_mod = useRef(null);
  let debounce_file_save = useRef(null);
  let debounce_cursor_move = useRef(null);
  let timeout_cursor_move = useRef(null);
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
  const [ownerId, setOwnerId] = useState(0);

  let [userNickName, setUserNickName] = useState("나");

  let [stuInfo, setStuInfo] = useState({});
  let [saveFileName, setSaveFileName] = useState("");

  let [initLineNum, setInitLineNum] = useState(0);
  let [initCursor, setInitCursor] = useState(0);

  /*
  const watchFeedBack=document.querySelector(".myLineDecoration");
  watchFeedBack.addEventListener("click",(()=>{
    //console.log(watchFeedBack);
  }))
  */

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
  }, [myPtcId]);

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
  let [copyCodeVal, setCopyCodeVal] = useState([]);
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

  let [submitFeedbackModalIsOpen, setSubmitFeedbackModalIsOpen] =
    useState(false);

  let [watchFeedbackModal, setWatchFeedbackModal] = useState(false);

  let [feedbackList, setFeedbackList] = useState([]);
  let [commentList, setCommentList] = useState([]);

  let [feedbackFile, setFeedbackFile] = useState("");
  let [feedbackLine, setFeedbackLine] = useState("");

  let interval_1sec = null;
  let timeout_activityPing = null;

  const editorDidMount = (editor, monaco) => {
    monacoRef.current = editor;
    monacomonacoRef.current = monaco;
    /*editor.addAction({
      // An unique identifier of the contributed action.
      id: "my-id",

      // A label of the action that will be presented to the user.
      label: "label",

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyCode.F8,
        // chord
      ],

      run: function (ed) {
        addQuestion(ed, monaco);
      },
    });*/
    editor.addCommand(monaco.KeyCode.F8, function () {
      addQuestion(editor, monaco);
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
            isWholeLine: true,
            firstLineDecorationClassName: "myLineDecoration",
          },
        },
      ]
    );
    setSubmitFeedbackModalIsOpen(true);
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

    clearTimeout(debounce_cursor_move.current);
    debounce_cursor_move.current = setTimeout(() => {
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
    }, 500)

    const _saveFileName = localStorage.getItem("currFileName");
    setCodeValue((code) => {
      saveCodeDeferred(_saveFileName, code);
      return code;
    });
  };

  function saveCodeDeferred(filename, content) {
    clearTimeout(debounce_file_save.current);
    debounce_file_save.current = setTimeout(() => {
      if (content.trim().length === 0) return; // fix bug

      socketio.current.emit("FILE_SAVE", {
        ownerId: userId,
        file: filename,
        content: content,
      });
    }, saveDelay);
  }

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
    let copy = [];
    for (let change of e.changes) {
      if (change.text === "") inputStr = 8;
      else inputStr = change.text;
      copy.push(inputStr);
    }
    if (copy.length <= 0) return; // 빈 정보는 전송하지 않음

    setCopyCodeVal(_copyCodeVal => {
      _copyCodeVal.push(...copy)

      clearTimeout(debounce_file_mod.current);
      debounce_file_mod.current = setTimeout(() => {
        socketio.current.emit("FILE_MOD", {
          ownerId: userId,
          file: localStorage.getItem("currFileName"),
          cursor: lineNum + "." + colNum,
          change: _copyCodeVal,
          timestamp: inputTime,
        })
        setCopyCodeVal(_ => []);
      }, 100);

      return _copyCodeVal;
    })
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
      setOwnerId(args.ownerId);
    });
    socket.on("CURSOR_MOVE", (args) => {
      let _myPtcId = localStorage.getItem("currMyPtcId");
      if (_myPtcId == args.ptcId) return;

      setCursorMove((prev) => {
        return args;
      });

      try {
        let lineInfo = args.fileInfo.cursor.split(".");
        setCurrentLine(lineInfo[0]);
        setCurrentCol(lineInfo[1]);
      } catch (e) { }

      clearTimeout(timeout_cursor_move.current)
      timeout_cursor_move.current = setTimeout(() => {
        setCursorMove((prev) => {
          return {};
        });
      }, 3000)
    });
    socket.on("FILE_SAVE", (args) => {
      // console.log(args);
    });
    socket.on("FILE_MOD", (args) => {
      const _myPtcId = parseInt(localStorage.getItem("currMyPtcId"));
      const _userId = parseInt(localStorage.getItem("currUserId"));
      const _saveFileName = localStorage.getItem("currFileName");

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

      let [lineNum, colNum] = args.cursor.split(".").map(item => parseInt(item))
      colNum = colNum - args.change.length + 1;
      try {
        let procCnt = 0;
        monacoPreventHandler.current = true;
        for (let c of args.change) {
          /*
          Range: start line, start col, end line, end col
          */
          let range;
          let op;
          if (c === 8) {
            range = new monacomonacoRef.current.Range(
              lineNum, colNum - 1 + procCnt,
              lineNum, colNum + procCnt,
            );
            op = {
              range: range,
              text: "",
              forceMoveMarkers: true
            };
          } else {
            range = new monacomonacoRef.current.Range(
              lineNum, colNum + procCnt,
              lineNum, colNum + procCnt,
            );
            op = {
              range: range,
              text: c,
              forceMoveMarkers: true
            };
          }
          monacoRef.current.executeEdits("my-source", [op]);
          procCnt += 1;
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

    socket.on("FEEDBACK_ADD", (args) => {
      console.log(args);
    });

    socket.on("FEEDBACK_LIST", (args) => {
      console.log(args);
      setFeedbackList((prev) => {
        return args;
      });
      setCommentList((prev) => {
        return args[0].comments;
      });
      if (args) {
        setWatchFeedbackModal((prev) => {
          return true;
        });
      }
    });
    socket.on("FEEDBACK_COMMENT", (args) => {
      console.log(args);
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
    let rect = monacoRef.current._domElement.getBoundingClientRect();
    let newHeight = footerRef.current.getBoundingClientRect().top - rect.top;
    monacoRef.current._domElement.style.height = newHeight + "px";
  };

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
          {location.state.asTeacher === "teacher" ? (
            <button
              className="watch-answer-btn"
              onClick={() => {
                socketio.current.emit("FEEDBACK_LIST");
              }}
            >
              질문 보기
            </button>
          ) : null}
          <span
            className="answering"
            style={{ color: "#b9c3dd", fontSize: 15, marginLeft: "10%" }}
          >
            질문 하기 (F8){" "}
          </span>
        </div>
        <div className="second-nav">
          <span className="lesson-info">
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
                              ? <FontAwesomeIcon icon={faSave} />
                              : <FontAwesomeIcon icon={faEdit} />}
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
                            <FontAwesomeIcon icon={faTrash} />
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
            <p className="side-navbar offline-stus">
              <div className="side-navbar-answer"></div>
              <span>질문 라인 도우미</span>
            </p>
            {feedbackLine && feedbackFile ? (
              <div className="file-line-helper">
                <div>
                  File :{" "}
                  <span className="feedback-file-span">{feedbackFile}</span>
                </div>
                <div>
                  질문 라인(lineNum-colNum) :{" "}
                  <span className="feedback-line-span">{feedbackLine}</span>
                </div>
              </div>
            ) : null}
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
                }}
                onFooterResize={onFooterResize}
              >
                <div
                  className="resizer top"
                  onMouseDown={(e) => {
                    document.onmousemove = resizeStartHandler(
                      footerRef,
                      true,
                      resizeEditorOnResizeFooter,
                      onFooterResize.current
                    );
                    document.onmouseup = resizeEndHandler;
                  }}
                />
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
      <Modal
        isOpen={submitFeedbackModalIsOpen}
        onRequestClose={() => setSubmitFeedbackModalIsOpen(false)}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 15, 15, 0.79)",
          },
          content: {
            position: "absolute",
            top: "40px",
            left: "25%",
            width: "45%",
            height: "60%",
            border: "1px solid #ccc",
            background: "#fff",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
          },
        }}
      >
        <SendFeedback
          monacoRef={monacoRef}
          saveFileName={saveFileName}
          ownerId={ownerId}
          socketio={socketio}
          setSubmitFeedbackModalIsOpen={setSubmitFeedbackModalIsOpen}
        />
      </Modal>

      <Modal
        isOpen={watchFeedbackModal}
        onRequestClose={() => setWatchFeedbackModal(false)}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 15, 15, 0.79)",
          },
          content: {
            position: "absolute",
            top: "40px",
            left: "15%",
            width: "65%",
            height: "60%",
            border: "1px solid #ccc",
            background: "#fff",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
          },
        }}
      >
        <WatchFeedback
          socketio={socketio}
          feedbackList={feedbackList}
          commentList={commentList}
          setFeedbackLine={setFeedbackLine}
          setFeedbackFile={setFeedbackFile}
          setSidebarBtn2={setSidebarBtn2}
          setWatchFeedbackModal={setWatchFeedbackModal}
        />
      </Modal>
    </div>
  );
};

function SendFeedback({
  monacoRef,
  saveFileName,
  ownerId,
  socketio,
  setSubmitFeedbackModalIsOpen,
}) {
  let lineNum = monacoRef.current.getPosition().lineNumber;

  let colNum = monacoRef.current.getPosition().column;

  let codeVal = monacoRef.current.getValue().split("\n");
  console.log(codeVal);

  let [feedbackInput, setFeedbackInput] = useState("");

  if (lineNum > 3) {
    codeVal = codeVal.slice(lineNum - 4, lineNum + 3);
  } else {
    codeVal = codeVal.slice(0, 4);
  }
  console.log(codeVal);

  const sendFeedback = () => {
    socketio.current.emit("FEEDBACK_ADD", {
      ref: {
        ownerId: ownerId, // 해당 파일의 소유자 ID
        file: saveFileName,
        line: lineNum + "-" + colNum,
      },
      acl: [], // 이 피드백을 볼 수 있는 유저 id
      comment: feedbackInput,
    });
    alert("질문 완료");
    setSubmitFeedbackModalIsOpen(false);
  };
  return (
    <div className="send-feedback-modal">
      <div className="send-feedback-file">{saveFileName}</div>
      <p style={{ color: "gray" }}>
        질문 할 라인 :{" "}
        <span style={{ color: "blue", fontWeight: "bold" }}>{lineNum}</span>
      </p>
      <div
        className="code-container"
        style={{
          backgroundColor: "#fafafa",
          width: "100%",
          height: "auto",
          alignItems: "baseline",
        }}
      >
        <pre style={{ backgroundColor: "#fafafa" }}>
          <code>
            <div style={{ marginBottom: 10 }}>...</div>

            {codeVal.map((i, idx) => {
              if (i === "\r") {
                return <div> </div>;
              }
              return (
                <>
                  {(codeVal.length >= 7 && idx === 3) ||
                    (codeVal.length < 7 && idx === lineNum - 1) ? (
                    <div className="answer-line">{i}</div>
                  ) : (
                    <div>{i}</div>
                  )}
                </>
              );
            })}
            <div style={{ marginTop: 10 }}>...</div>
          </code>
        </pre>
      </div>
      <textarea
        className="send-feedback-input"
        placeholder="내용을 입력 하세요"
        onChange={(e) => {
          setFeedbackInput(e.target.value);
        }}
      />
      <button className="send-feedback-btn" onClick={sendFeedback}>
        질문 하기
      </button>
    </div>
  );
}

function WatchFeedback({
  socketio,
  feedbackList,
  commentList,
  setSidebarBtn2,
  setFeedbackFile,
  setFeedbackLine,
  setWatchFeedbackModal,
}) {
  console.log(feedbackList);
  console.log(commentList);
  const ownerId = feedbackList[0].ownerId;
  let [inputTarget, setInputTarget] = useState(0);
  let [inputToggle, setInputToggle] = useState(false);

  let [sendFeedbackInput, setSendFeedbackInput] = useState("");
  return (
    <div>
      {feedbackList[0].feedbacks &&
        feedbackList[0].feedbacks.map((item, idx) => {
          return (
            <>
              <div className="feedback-list-bar">
                <p className="feedback-name" style={{ fontWeight: "bold" }}>
                  {item.nickname}
                </p>{" "}
                <p
                  className="feedback-file"
                  onClick={() => {
                    socketio.current.emit("FILE_READ", {
                      ownerId: ownerId,
                      file: item.file,
                    });
                    setFeedbackFile(item.file);
                    setFeedbackLine(item.line);
                    setSidebarBtn2("학생");
                    setWatchFeedbackModal(false);

                    /* 작동 안함
                    let splitLine = item.line.split("-");
                    console.log(splitLine);
                    monacoRef.current.focus();
                    monacoRef.current.setPosition({
                      column: Number(splitLine[1]),
                      lineNumber: Number(splitLine[0]),
                    });
                    monacoRef.current.deltaDecorations(
                      [],
                      [
                        {
                          range: new monacoRef.current.Range(
                            Number(splitLine[0]),
                            1,
                            Number(splitLine[0]),
                            1
                          ),
                          options: {
                            isWholeLine: true,
                            firstLineDecorationClassName: "myLineDecoration",
                          },
                        },
                      ]
                    );*/
                  }}
                >
                  {item.file}
                </p>{" "}
                <p className="feedback-line">
                  line : <span>{item.line}</span>
                </p>
                {commentList &&
                  commentList.map((comment, i) => {
                    if (comment.feedbackId === item.id) {
                      return (
                        <>
                          <p className="feedback-content">{comment.content}</p>
                        </>
                      );
                    }
                  })}
                <button
                  className="send-feedback-toggle-btn"
                  value={item.id}
                  onClick={(e) => {
                    setInputToggle(!inputToggle);
                    setInputTarget(e.currentTarget.value);
                    console.log(inputTarget);
                  }}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
              </div>
              {inputToggle && inputTarget == item.id ? (
                <div className="send-feedback-input-container">
                  <input
                    onChange={(e) => {
                      setSendFeedbackInput(e.target.value);
                    }}
                  />
                  <button
                    className="send-feedback-input-btn"
                    onClick={() => {
                      socketio.current.emit("FEEDBACK_COMMENT", {
                        feedbackId: item.id,
                        content: sendFeedbackInput,
                      });
                    }}
                  >
                    전송
                  </button>
                </div>
              ) : null}
            </>
          );
        })}
    </div>
  );
}
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
