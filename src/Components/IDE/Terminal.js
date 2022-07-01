import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { TerminalMenu } from "./TerminalMenu";
import { RUNTIME_URL } from "../../constants";
import { api } from "../../utils/http";
import { DEBUG } from "../../constants";

export function Terminal({ footerRef, onFooterResize, children }) {
  // 현재 보고있는 유저 ptc ID 전송
  // agent 는 이를 받고, ws 서버로 전송
  // ws 서버는 해당 요청에 대한 유저의 모든 파일 구조를 redis 에서 반환
  // agent 는 이를 받고, 파일들을 생성
  // 준비 응답을 받은 클라는 ssh 으로 특정 실행 명령을 실행

  const termFunc = useRef(null);
  const runtimeInfo = useRef(null);

  const execCode = () => {
    let m = window.location.pathname.match(/^\/course\/(\d+)\/lesson\/(\d+).*/);
    let courseId = parseInt(m[1]);
    let lessonId = parseInt(m[2]);

    let targetPtcId = localStorage.getItem("currUserId");
    let currFileName = localStorage.getItem("currFileName");

    const url = DEBUG
      ? `http://${runtimeInfo.current.url}:${runtimeInfo.current.port}/run/start`
      : `${RUNTIME_URL}${runtimeInfo.current.url}/${runtimeInfo.current.port}/run/start`;

    api
      .post(url, {
        target_ptc_id: targetPtcId,
        course_id: courseId,
        lesson_id: lessonId,
      })
      .then((res) => {
        termFunc.current(currFileName);
      });
  };

  return (
    <div className="editor-footer" ref={footerRef}>
      {children}
      <div className="bottom-bar">
        <span>터미널&nbsp;</span>
        <span
          onClick={(e) => {
            execCode();
          }}
        >
          실행&nbsp;
          <FontAwesomeIcon icon={faPlay} color="#00912c" />
        </span>
      </div>
      <div className="terminal-wrapper">
        <TerminalMenu
          termFunc={termFunc}
          runtimeInfo={runtimeInfo}
          onFooterResize={onFooterResize}
        />
      </div>
    </div>
  );
}
