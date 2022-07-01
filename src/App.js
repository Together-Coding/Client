import "./App.css";
import React, { useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Home from "./Components/Home/Home";
import IDE_HOME from "./Components/IDE/IDE";
import RegisterPage from "./Components/User/RegisterPage";
import LoginPage from "./Components/User/LoginPage";
import TeacherDashBoard from "./Components/DashBoard/TeacherDashBoard";
import StudentDashBoard from "./Components/DashBoard/StudentDashBoard";
import MyInfo from "./Components/UserInfo/MyInfo";
import CodeModal from "./Components/DashBoard/CodeModal";
import AsTeacherMain from "./Components/ClassMain/AsTeacherMain";
import AsStudentMain from "./Components/ClassMain/AsStudentMain";
import MyInfoFix from "./Components/UserInfo/MyInfoFix";
import Modal from "react-modal";
import MyCourseFix from "./Components/ClassMain/MyCourseFix";
function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/course">
          <IDE_HOME />
        </Route>
        <Route path="/user/register">
          <RegisterPage />
        </Route>
        <Route path="/user/login">
          <LoginPage />
        </Route>
        <Route path="/me">
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
        <Route path="/teacher/:id">
          <AsTeacherMain />
        </Route>
        <Route path="/student/:id">
          <AsStudentMain />
        </Route>
        <Route path="/fix-info">
          <MyInfoFix />
        </Route>
        <Route path="/changeInfo">
          <MyCourseFix />
        </Route>
      </Switch>
    </div>
  );
}
Modal.setAppElement("#root");

export default App;
