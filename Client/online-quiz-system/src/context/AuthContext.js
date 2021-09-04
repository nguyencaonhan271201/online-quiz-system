import { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
    user: null,
    isFetching: false,
    error: false
}

export const AuthContext = createContext(INITIAL_STATE);
export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, [], () => {
        const localData = localStorage.getItem("auth_state");
        return localData? JSON.parse(localData) : []
    });
    useEffect(() => {
        localStorage.setItem("auth_state", JSON.stringify(state));
    }, [state])
    return (
        <AuthContext.Provider value = {{
            user: state.user, 
            isFetching: state.isFetching, 
            error: state.error,
            dispatch,
        }}>
        {children}
        </AuthContext.Provider>
    )
}