import { useRef, useEffect, useState } from "react";
import { SSHClient } from "../utils/websocket";
import { XTerm } from "xterm-for-react";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

/**
 * 터미널 메뉴
 * TODO: 외부 HTML 요소들과의 유동적인 width, height 를 적용해주면 좋을 것 같습니다.
 * @return {JSX.Element}
 * @constructor
 */
export function TerminalMenu() {
  let token = localStorage.getItem("access_token");

  // xterm Terminal
  let xtermRef = useRef();
  let terminalWrapper = useRef();
  // FitAddon: xtermRef 를 부모 요소 크기에 맞게 조정
  const fitAddon = new FitAddon();
  // Terminal options
  let [ptyCols, setPtyCols] = useState(0);
  let [ptyRows, setPtyRows] = useState(0);
  const xtermOptions = {
    cursorBlink: true,
    theme: {
      background: "#2f3336",
      foreground: "#ffffff",
    },
  };

  let sshClient = useRef();
  useEffect(() => {
    terminalWrapper.current = document.getElementsByClassName('terminal-wrapper')[0];
    window.onresize = resizeTerminal;
    fitAddon.fit();

    // FIXME Bridge 서버로부터 컨테이너 URL 을 받아서 사용
    sshClient.current = new SSHClient("http://127.0.0.1:8000/", token);

    sshClient.current.on("AUTHENTICATE", (data) => {
      if (data === "AUTHENTICATE") {
        sshClient.current.emit("SSH_CONNECT", "SSH_CONNECT");
      }
    });

    // 'SSH' 이벤트로 보낸 입력값을 되돌려 받고, 이를 터미널에 보여줍니다.
    sshClient.current.on("SSH_RELAY", (data) => {
      xtermRef.current.terminal.write(decodeText(data));
    });
  }, []);

  /**
   * SSH 서버에 보내기 전, 데이터를 인코딩
   * @param text
   * @return {*}
   */
  let encodeText = (text) => {
    return text;
  };

  /**
   *
   * @param text 디코드 할 바이너리 데이터
   * @return {string}
   */
  let decodeText = (text) => {
    // Promise 방식으로 디코딩하여 터미널에 보여주면 좋을 것 같음
    return String.fromCharCode.apply(null, new Uint8Array(text));
  };

  /**
   * 유저가 xterm 에 입력을 하면, 이를 SSH relay 서버로 전송합니다.
   * @param data
   */
  let onData = (data) => {
    sshClient.current.emit("SSH", encodeText(data));
  };

  let onScroll = (newPos) => {
    // TODO
    console.log("onScroll", newPos);
  };

  /**
   * window.onresize 이벤트
   */
  let resizeTerminal = () => {
    // 부모 요소 크기 변경 후 항상 호출
    fitAddon.fit();

    // 새로운 pty 크기 계산
    let cols = parseInt(
      terminalWrapper.current.clientWidth /
        xtermRef.current.terminal._core._renderService._renderer.dimensions
          .actualCellWidth
    );
    let rows = parseInt(
      terminalWrapper.current.clientHeight /
        xtermRef.current.terminal._core._renderService._renderer.dimensions
          .actualCellHeight
    );

    if (ptyCols === cols && ptyRows === rows) return;
    onResize({ cols, rows });
    setPtyCols(cols);
    setPtyRows(rows);
  };

  /**
   * pty 크기 조정
   * @param cols pty width
   * @param rows pty height
   */
  let onResize = ({ cols, rows }) => {
    xtermRef.current.terminal.resize(cols, rows);
    if (sshClient.current) {
      sshClient.current.emit("SSH_RESIZE", { cols, rows });
    }
  };

  return (
    <>
      <XTerm
        ref={xtermRef}
        className={"xterm-terminal"}
        options={xtermOptions}
        addons={[fitAddon]}
        onData={onData}
        onResize={onResize}
        onScroll={onScroll}
      />
    </>
  );
}
