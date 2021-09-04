import React from 'react';
import {useState, useRef, useContext} from "react";
import Modal from "react-bootstrap/Modal"
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { Dialog, DialogTitle, DialogContent, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import "./auth.css";
import axios from "axios";
import {loginCall} from "../../apiCalls";
import {AuthContext} from "../../context/AuthContext";
import Logo from "./../../assets/images/ncn.png";
import Cover from "./../../assets/images/cover.png";

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://nhannc.site/">
            Nguyen Cao Nhan
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: `url(${Cover})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    dialogWrapper: {
        padding: theme.spacing(2),
        position: 'absolute',
        top: theme.spacing(5)
    },
    dialogTitle: {
        paddingRight: '0px'
    }
}));

export default function Auth() {
    const classes = useStyles();
    const [openPopup, setOpenPopup ] = React.useState(false);
    const [loginError, setLoginError] = React.useState("");
    const [registerError, setRegisterError] = React.useState("");
    const {dispatch} = useContext(AuthContext);
    
    //Login refs
    const username = useRef();
    const password = useRef();
    
    //Register refs
    const usernameCreate = useRef();
    const fullnameCreate = useRef();
    const passwordCreate = useRef();
    const passwordConfirm = useRef();

    const handleLogin = async(e) => {
        e.preventDefault();
        loginCall({username: username.current.value, password: password.current.value}, dispatch);
    }

    const handleRegister = async(e) => {
        e.preventDefault();
        if (passwordConfirm.current.value !== passwordCreate.current.value) {
            setRegisterError("Xác nhận mật khẩu không đúng");
        } else {
            const user = {
                username: usernameCreate.current.value,
                fullname: fullnameCreate.current.value,
                password: passwordCreate.current.value
            }
            try {
                await axios.post("https://online-quiz-system-server.herokuapp.com/api/auth/register", user);
                //Perform login
                loginCall({username: usernameCreate.current.value, password: passwordCreate.current.value}, dispatch);
            } catch (err) {
                console.log(err);
                setRegisterError("Có lỗi xảy ra, vui lòng thử lại sau!");
            }
        }
    }

    return (
        <>
            <Grid container component="main" className={classes.root}>
                <CssBaseline />
                <Grid item xs={false} sm={6} md={7} className={classes.image} />
                <Grid item xs={12} sm={6} md={5} component={Paper} elevation={12} square style={{display: "flex", alignItems: "center"}}>
                    <div className={classes.paper} style={{width: "100%"}}>
                        <div className="text-center logo-container">
                            <img src={Logo}>
                            </img>
                        </div>
                        <Typography component="h1" variant="h5">
                            Đăng nhập
                        </Typography>
                        <form onSubmit={handleLogin} className={classes.form}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Tên đăng nhập"
                                name="username"
                                autoFocus
                                inputRef={username}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="Mật khẩu"
                                name="password"
                                type="password"
                                inputRef={password}
                            />
                            <p style={{margin: 0, padding: 0, color: "red", fontStyle: "italic"}}>{loginError}</p>
                            <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            >
                            Đăng nhập
                            </Button>
                            <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2" style={{opacity: 0}}>
                                    Quên mật khẩu?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="#" onClick={() => setOpenPopup(true)}>
                                    Tạo tài khoản
                                </Link>
                            </Grid>
                            </Grid>
                            <Box mt={5}>
                            <Copyright />
                            </Box>
                        </form>
                    </div>
                </Grid>
            </Grid>
            <Dialog open={openPopup} maxWidth="sm" fullWidth="true" classes={{ paper: classes.dialogWrapper }}>
                <DialogTitle className={classes.dialogTitle}>
                    <div style={{ display: 'flex' }}>
                        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
                            Đăng ký
                        </Typography>
                        <Button
                            color="primary"
                            onClick={()=>{setOpenPopup(false)}}>
                            <CloseIcon />
                        </Button>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleRegister} className={classes.form}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username-create"
                            label="Tên đăng nhập"
                            name="username-create"
                            inputProps={{ minLength: 6 }}
                            inputRef={usernameCreate}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="fullname"
                            label="Tên đầy đủ"
                            name="fullname"
                            type="text"
                            inputRef={fullnameCreate}
                        />
                        <Grid container>
                            <Grid item md={6} xs={12} className="leftSubGrid">
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="password-create"
                                    label="Mật khẩu"
                                    name="password-create"
                                    type="password"
                                    inputProps={{ minLength: 6 }}
                                    inputRef={passwordCreate}
                                />
                            </Grid>
                            <Grid item md={6} xs={12} className="rightSubGrid">
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="password-confirm"
                                    label="Xác nhận mật khẩu"
                                    name="password-confirm"
                                    type="password"
                                    inputRef={passwordConfirm}
                                />
                            </Grid>
                        </Grid>
                        <p style={{margin: 0, padding: 0, color: "red", fontStyle: "italic"}}>{registerError}</p>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="secondary"
                            className={classes.submit}>
                                Đăng ký tài khoản
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
