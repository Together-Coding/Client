import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/TeacherDashboard.scss";

let userMockData = [
  {
    id: 1,
    name: "권순용",
    stuNum: "12153057",
    질문: "투게더 코딩 화이팅",
    needHelp: true,
    questionSolved: false,
  },
  {
    id: 2,
    name: "권광민",
    stuNum: "12161527",
    질문: "이 부분 너무 쉽습니다",
    needHelp: true,
    questionSolved: false,
  },
  {
    id: 3,
    name: "차선욱",
    stuNum: "12161665",
    질문: "맞왜틀???",
    needHelp: false,
    solved: false,
    questionSolved: false,
  },
];

function DashBoard() {
  const location = useLocation();
  
  let [question, setQuestion] = useState([]);
  let [solvedQuestion, setSolvedQuestion] = useState([]);

  let [solvedCheckInput, setSolvedCheckInput] = useState(new Set());
  let [bChecked, setChecked] = useState(false);

  let [unsolvedCheckInput, setunSolvedCheckInput] = useState(new Set());
  let [cChecked, setcChecked] = useState(false);
  //-------------------새질문 체크박스 관리

  let questionIdx = [];
  question.map((x) => {
    questionIdx.push(x.id);
  });
  questionIdx.sort();
  questionIdx.map((x) => {
    userMockData[x - 1].questionSolved = true;
  });
  if (question.length > 0) {
    setQuestion([]);
  }

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
    solvedCheckControl(
      userMockData[Number(e.target.value) - 1],
      e.target.checked
    );
  };

  const solvedClickHandler = () => {
    let copy = [...solvedCheckInput];
    setQuestion(copy);
    setSolvedCheckInput(new Set());
  };
  //-------------------해결된 질문 체크박스 관리

  let solvedQuestionIdx = [];
  solvedQuestion.map((x) => {
    solvedQuestionIdx.push(x.id);
  });
  solvedQuestionIdx.sort();
  solvedQuestionIdx.map((x) => {
    userMockData[x - 1].questionSolved = false;
  });

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
      userMockData[Number(e.target.value) - 1],
      e.target.checked
    );
  };

  const unsolvedClickHandler = () => {
    let copy = [...unsolvedCheckInput];
    setSolvedQuestion(copy);
    if (solvedQuestion.length > 0) {
      setSolvedQuestion([]);
    }
  };

  return (
    <div>
      <div className="dash-board-nav">
        <p>{location.state.class}</p>
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
      {userMockData.map((x, idx) => {
        if (x.questionSolved === false) {
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
        }
      })}

      <div className="new-question-bar">
        <span>해결된 질문</span>
        <button onClick={unsolvedClickHandler}>새 질문으로</button>
      </div>
      {userMockData.map((x, idx) => {
        if (x.questionSolved === true) {
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
        }
      })}
    </div>
  );
}

export default DashBoard;
