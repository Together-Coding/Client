import "./App.css";
import React, { useState } from "react";
import {Link, Route, Switch} from "react-router-dom";
import Editor from "@monaco-editor/react";
import Home from "./Components/Home";
import IDE from "./Components/IDE";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route export path="/" component={IDE}/>
      </Switch>
    </div>
  );
}

export default App;
