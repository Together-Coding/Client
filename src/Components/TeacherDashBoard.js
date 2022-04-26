import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/TeacherDashboard.scss";
import { Link } from "react-router-dom";
/*let userMockData = [
  {
    id: 1,
    name: "권순용",
    stuNum: "12153057",
    질문: [
      {
        content: "투게더 코딩 화이팅",
        code: "code1",
        line: "10-24",
      },
    ],
    needHelp: true,
    questionSolved: false,
  },
  {
    id: 2,
    name: "권광민",
    stuNum: "12161527",
    질문: [
      {
        content: "이부분 너무 쉽습니다",
        code: "code2",
        line: "1-2",
      },
      {
        content: "이부분도 개쉽습니다",
        code: "code3",
        line: "3-10",
      },
    ],
    needHelp: true,
    questionSolved: false,
  },
  {
    id: 3,
    name: "차선욱",
    stuNum: "12161665",
    질문: [{ content: "맞왜틀???", code: "code4", line: "5-30" }],
    needHelp: false,
    solved: false,
    questionSolved: false,
  },
];*/

//console.log(userMockData);

function DashBoard() {
  const location = useLocation();
  console.log(location);
  let [userMockData, setMockData] = useState([
    {
      id: 1,
      name: "권순용",
      stuNum: "12153057",
      질문: [
        {
          content: "투게더 코딩 화이팅",
          code: "code1",
          line: "10-24",
        },
      ],
      needHelp: true,
      questionSolved: false,
    },
    {
      id: 2,
      name: "권광민",
      stuNum: "12161527",
      질문: [
        {
          content: "이부분 너무 쉽습니다",
          code: "code2",
          line: "1-2",
        },
        {
          content: "이부분도 개쉽습니다",
          code: "code3",
          line: "3-10",
        },
      ],
      needHelp: true,
      questionSolved: false,
    },
    {
      id: 3,
      name: "차선욱",
      stuNum: "12161665",
      질문: [{ content: "맞왜틀???", code: "code4", line: "5-30" }],
      needHelp: false,
      solved: false,
      questionSolved: false,
    },
  ]);

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
  console.log(questionIdx);

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
    console.log(e.target.value);
    setChecked(!bChecked);
    solvedCheckControl(
      userMockData[Number(e.target.value) - 1],
      e.target.checked
    );
  };

  const solvedClickHandler = () => {
    let copy = [...solvedCheckInput];
    setQuestion(copy);
    console.log(question);
    setSolvedCheckInput(new Set());
  };
  console.log(solvedCheckInput);
  //-------------------해결된 질문 체크박스 관리
  /*
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
  */
  const deleteControl = (e) => {
    let deleteID = e.target.value;
    let copy = [...userMockData];
    copy[deleteID - 1] = { ...copy[deleteID - 1], 질문: [] };
    setMockData(copy);
  };

  return (
    <div>
      <div className="dash-board-nav">
        <p>
          {location.state.class} ({location.state.week}주차)
        </p>
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
        if (x.questionSolved === false && x.질문.length > 0) {
          return (
            <div className="stu-name">
              <input
                value={idx + 1}
                type="checkbox"
                onChange={solvedCheckHandler}
              />
              <span style={{ fontWeight: "bold" }}>{x.name} </span>
              <span>{x.stuNum}</span>
              {x.질문.map((item, idx) => {
                return (
                  <div className="question" style={{ fontSize: "14px" }}>
                    <Link
                      to={{
                        pathname: "/code/" + x.name + "/" + idx,
                        state: {
                          code: item.code,
                        },
                      }}
                    >
                      <div>
                        Line : {item.line} / {item.content}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        }
      })}

      <div className="new-question-bar">
        <span>해결된 질문</span>
      </div>
      {userMockData.map((x, idx) => {
        if (x.questionSolved === true && x.질문.length > 0) {
          return (
            <div className="solved-question">
              <span style={{ fontWeight: "bold" }}>{x.name} </span>
              <span>
                {x.stuNum}{" "}
                <button value={x.id} onClick={deleteControl}>
                  X
                </button>
              </span>
              {x.질문.map((item) => {
                return (
                  <div className="line-box">
                    <Link
                      to={{
                        pathname: "/code/" + x.name + "/" + idx,
                        state: {
                          code: item.code,
                        },
                      }}
                    >
                      <div>
                        Line : {item.line} / {item.content}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

export default DashBoard;
