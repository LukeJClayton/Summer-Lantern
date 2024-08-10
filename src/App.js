import React, { useState, useContext } from 'react';
import { useLoadSave } from "./js/SaveHandler.js";

import { SaveContext, SaveProvider } from "./context/Save.js"
import { FileContext, FileProvider } from "./context/File.js"

import { SaveHandler } from './components/SaveHandler.js'
import { GemsMenu } from './components/Gems.js'

import './App.css';


function Main(props) {
  return (
    <div className="main">
      <p className="main__title">Summer Lantern: Bloodborne Save Editor</p>
      <SaveHandler />
      <GemsMenu />
    </div>
  );
}

function App() {
  return (
    <FileProvider>
      <SaveProvider>
        <Main />
      </SaveProvider>
    </FileProvider>
  );
}

export default App;
