import Auth from "./pages/auth/Auth";
import Home from "./pages/home/Home";
import QuizMain from "./pages/quiz-main/QuizMain";
import QuizAttempts from "./pages/quiz-attempts/QuizAttempts";
import MyAttempts from "./pages/my-attempts/MyAttempts";
import Headbar from "./components/headbar/Headbar";
import QuizCreate from "./pages/quiz-create/QuizCreate";
import "./assets/css/index.css";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
    const {user} = useContext(AuthContext);

    useEffect(() => {
        switch (window.location.pathname) {
            case "/":
                document.title = "Online Quiz System";
                break;
            case "/home":
                document.title = "Online Quiz System | Home";
                break;
            case "/attempts":
                document.title = "Online Quiz System | My Records";
                break;
            case "/join":
                document.title = "Online Quiz System | Quiz";
                break;
            case "/create":
                document.title = "Online Quiz System | Create";
                break;
            case "/dashboard":
                document.title = "Online Quiz System | Quiz Records";
                break;
        }
    }, [window.location.pathname])

    return (
        <div>
            {/* {window.location.pathname !== "/join" && user && <Headbar></Headbar>} */}


            <Router>
                <Switch>
                
                <Route exact path="/">
                    {user? <Redirect to="/home"></Redirect> : <Auth></Auth>}
                </Route>
                {
                    user && 
                    <Route exact path="/join" 
                        render={(props) => <QuizMain {...props}/>}
                    />
                }
                {
                    !user && 
                    <Route exact path="/join" 
                    ><Redirect to="/"></Redirect></Route>
                }
                <div>
                    {window.location.pathname !== "/join" && user && <Headbar></Headbar>}
                    <Route exact path="/home">
                        {user? <Home></Home> : <Redirect to="/"></Redirect>}
                    </Route>
                    <Route exact path="/create">
                        {user && user.role === 1? <QuizCreate></QuizCreate> : <Redirect to="/"></Redirect>}
                    </Route>
                    {
                        user && 
                        <>
                        <Route exact path="/join" 
                            render={(props) => <QuizMain {...props}/>}
                        />
                        <Route exact path="/dashboard" 
                            render={(props) => <QuizAttempts {...props}></QuizAttempts>}
                        />
                        <Route exact path="/attempts" 
                            render={(props) => <MyAttempts {...props}></MyAttempts>}
                        />
                        </>
                    }
                    {
                        !user && 
                        <>
                        <Route exact path="/join" 
                        ><Redirect to="/"></Redirect></Route>
                        <Route exact path="/dashboard" 
                        ><Redirect to="/"></Redirect></Route>
                        <Route exact path="/attempts" 
                        ><Redirect to="/"></Redirect></Route>
                        </>
                    }
                </div>  
                </Switch>
            </Router>
        </div>
    );
}

export default App;
