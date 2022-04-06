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

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/IDE">
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
        <Route paht="student-dashboard">
          <StudentDashBoard />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
