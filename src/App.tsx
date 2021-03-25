import React from 'react';

import './App.css';

import {
    BrowserRouter,
    Switch,
    Route
} from "react-router-dom";

import Ping from './Ping';

class App extends React.Component {
    render() {
        return (
          <div className="App">
            <BrowserRouter>
              <Switch>
                  <Route exact path="/ping" component={Ping}/>
              </Switch>
            </BrowserRouter>
          </div>
        );
    }
}

export default App;
