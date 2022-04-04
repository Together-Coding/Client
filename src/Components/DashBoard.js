import { fas } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import "../Dashboard.scss";

let userMockData = [
  {
    id: 1,
    name: "권순용",
    stuNum: "12153057",
    질문: "투게더 코딩 화이팅",
    needHelp: true,
  },
  {
    id: 2,
    name: "권광민",
    stuNum: "12161527",
    질문: "이 부분 너무 쉽습니다",
    needHelp: true,
  },
  {
    id: 3,
    name: "차선욱",
    stuNum: "12161665",
    질문: "맞왜틀???",
    needHelp: false,
  },
];
let question = [
  {
    id: 1,
    name: "권순용",
    stuNum: "12153057",
    질문: "투게더 코딩 화이팅",
  },
  {
    id: 2,
    name: "권광민",
    stuNum: "12161527",
    질문: "이 부분 너무 쉽습니다",
  },
  {
    id: 3,
    name: "차선욱",
    stuNum: "12161665",
    질문: "맞왜틀???",
  },
];

function DashBoard() {
  let [solvedCheckInput, setSolvedCheckInput] = useState(new Set());
  let [bChecked, setChecked] = useState(false);

  let [solvedQuestion, setSolvedQuestion] = useState([]);

  let solvedIndex = [];

  let [unsolvedCheckInput, setunSolvedCheckInput] = useState(new Set());
  let [cChecked, setcChecked] = useState(false);

  let [unsolvedQuestion, setunSolvedQuestion] = useState([]);

  let unsolvedIndex = [];
  //-------------------새질문 체크박스 관리
  solvedQuestion.map((x) => {
    solvedIndex.push(x.id);
  });
  solvedIndex.sort();
  solvedIndex.map((x) => {
    delete question[x - 1];
  });

  const solvedCheckControl = (id, isChecked) => {
    if (isChecked) {
      solvedCheckInput.add(id);
      setSolvedCheckInput(solvedCheckInput);
    } else if (!isChecked && solvedCheckInput.has(id)) {
      solvedCheckInput.delete(id);
      setSolvedCheckInput(solvedCheckInput);
    }
  };
  const solvedCheckHandler = (e) => {
    setChecked(!bChecked);
    solvedCheckControl(question[Number(e.target.value) - 1], e.target.checked);
  };

  const solvedClickHandler = () => {
    let copy = [...solvedCheckInput];
    setSolvedQuestion(copy);
  };
  //-------------------해결된 질문 체크박스 관리

  const unsolvedCheckControl = (id, isChecked) => {
    if (isChecked) {
      unsolvedCheckInput.add(id);
      setunSolvedCheckInput(solvedCheckInput);
    } else if (!isChecked && unsolvedCheckInput.has(id)) {
      unsolvedCheckInput.delete(id);
      setunSolvedCheckInput(unsolvedCheckInput);
    }
  };
  const unsolvedCheckHandler = (e) => {
    setcChecked(!cChecked);
    unsolvedCheckControl(
      solvedQuestion[Number(e.target.value) - 1],
      e.target.checked
    );
  };
  console.log(unsolvedCheckInput);

  const unsolvedClickHandler = () => {
    let copy = [...unsolvedCheckInput];
    setunSolvedQuestion(copy);
    unsolvedQuestion.map((x) => {
      question.push(x);
    });
  };
  console.log(unsolvedQuestion);

  return (
    <div>
      <div className="dash-board-nav">
        <p>nav-bar</p>
      </div>
      <div className="dash-side-bar">
        sideBar
        <button>필요시</button>
        <button>기능</button>
        <button>추가</button>
        <button>!!!</button>
      </div>
      <div className="dash-main">
        <div className="dash-list">
          {userMockData.map((x) => {
            return (
              <div className="stu-info">
                <span>
                  {x.name} {x.stuNum}
                </span>
                <span>Need Help: {x.needHelp ? "O" : "X"}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="new-question-bar">
        <span>새질문</span>
        <button onClick={solvedClickHandler}>해결된 질문으로</button>
      </div>
      {question.map((x, idx) => {
        return (
          <div>
            <input
              value={idx + 1}
              type="checkbox"
              onChange={solvedCheckHandler}
            />
            <span>{x.name}</span>
            <span>{x.stuNum}</span>
            <span>{x.질문}</span>
          </div>
        );
      })}
      <div className="new-question-bar">
        <span>해결된 질문</span>
        <button onClick={unsolvedClickHandler}>새 질문으로 (안됨...)</button>
      </div>
      {solvedQuestion.map((x, idx) => {
        return (
          <div>
            <input
              value={idx + 1}
              type="checkbox"
              onChange={unsolvedCheckHandler}
            />
            <span>{x.name}</span>
            <span>{x.stuNum}</span>
            <span>{x.질문}</span>
          </div>
        );
      })}
    </div>
  );
}

export default DashBoard;
