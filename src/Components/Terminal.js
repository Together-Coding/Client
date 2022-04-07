import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { TerminalMenu } from "./TerminalMenu";

export function Terminal() {
  return (
    <div>
      <div className="bottom-bar">
        <span>
          터미널&nbsp;
          <FontAwesomeIcon icon={faPlay} color="#00912c" />
        </span>
      </div>
      <div className="content-wrapper">
        <TerminalMenu />
      </div>
    </div>
  );
}
