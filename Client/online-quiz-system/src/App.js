import Auth from "./pages/auth/Auth";
import Home from "./pages/home/Home";
import QuizMain from "./pages/quiz-main/QuizMain";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const {user} = useContext(AuthContext);
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            {user? <Redirect to="/home"></Redirect> : <Auth></Auth>}
          </Route>
          <Route exact path="/home">
            {user? <Home></Home> : <Redirect to="/"></Redirect>}
          </Route>
          <Route exact path="/join" render={(props) => <QuizMain {...props}/>}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
