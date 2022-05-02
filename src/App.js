import "./App.css";
import React, { useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Home from "./Components/Home";
import IDE_HOME from "./Components/IDE";
import RegisterPage from "./Components/RegisterPage";
import LoginPage from "./Components/LoginPage";
import TeacherDashBoard from "./Components/TeacherDashBoard";
import StudentDashBoard from "./Components/StudentDashBoard";
import MyInfo from "./Components/MyInfo";
import CodeModal from "./Components/CodeModal";
import AsTeacherMain from "./Components/AsTeacherMain";
import AsStudentMain from "./Components/AsStudentMain";

import Modal from "react-modal";
function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/IDE">
          <IDE_HOME />
        </Route>
        <Route exact path="/register">
          <RegisterPage />
        </Route>
        <Route exact path="/login">
          <LoginPage />
        </Route>
        <Route exact path="/myInfo">
          <MyInfo />
        </Route>
        <Route path="/teacher-dashboard">
          <TeacherDashBoard />
        </Route>
        <Route path="/student-dashboard">
          <StudentDashBoard />
        </Route>
        <Route path="/code">
          <CodeModal />
        </Route>
        <Route path="/teacher-main">
          <AsTeacherMain />
        </Route>
        <Route path="/student-main">
          <AsStudentMain />
        </Route>
      </Switch>
    </div>
  );
}
Modal.setAppElement("#root");

export default App;
