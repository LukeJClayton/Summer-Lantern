import React, { useState, useContext, useEffect } from 'react';
import { useLoadSave } from "./js/SaveHandler.js";

import { SaveContext, SaveProvider } from "./context/Save.js"
import { FileContext, FileProvider } from "./context/File.js"

import { SaveHandler } from './components/SaveHandler.js'
import { GemsMenu } from './components/Gems.js'
import { ItemsMenu } from './components/Items.js'

import './App.css';


function Main(props) {
  const [activeTab, setActiveTab] = useState('test')
  const {save, setSave} = useContext(SaveContext);

  function TabMenu() {
    return (
      <div>
        <button onClick={() => {setActiveTab('gems')}}>
          GEMS
        </button>
        <button onClick={() => {setActiveTab('items')}}>
          ITEMS
        </button>
      </div>
    )
  }

  return (
    <div className="main">
      <p className="main__title">Summer Lantern: Bloodborne Save Editor</p>
      <SaveHandler />
      {save &&
        <TabMenu />
      }
      {save && activeTab == 'gems' &&
        <GemsMenu />
      }
      {save && activeTab == 'items' &&
        <ItemsMenu />
      }
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
