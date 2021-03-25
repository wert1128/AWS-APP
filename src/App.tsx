import React from 'react';

import './App.css';

import {
    BrowserRouter,
    Switch,
    Route
} from "react-router-dom";

import C3File from './C3File';

class App extends React.Component {
    render() {
        return (
          <div className="App">
            <BrowserRouter>
              <Switch>
                  <Route exact path="/" component={C3File}/>
              </Switch>
            </BrowserRouter>
          </div>
        );
    }
}

export default App;
