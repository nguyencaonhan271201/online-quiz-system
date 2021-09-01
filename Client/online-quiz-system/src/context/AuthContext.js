import { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
    user: {
        username: "ncn2k1",
        password: "123456",
        id: 1
    },
    isFetching: false,
    error: false
}

export const AuthContext = createContext(INITIAL_STATE);
export const AuthContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

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