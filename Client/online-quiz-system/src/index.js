import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {AuthContextProvider} from "./context/AuthContext"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter} from 'react-router-dom';

const render = Component => {
  ReactDOM.render(
    <AuthContextProvider>
      <App />
    </AuthContextProvider>,
    document.getElementById('root')
  );  
}

render(App)