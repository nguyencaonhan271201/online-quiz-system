import {React, useContext} from 'react';
import {Navbar, Nav, Container, NavDropdown} from "react-bootstrap";
import './headbar.css';
import Logo from "./../../assets/images/ncn.png";
import {AuthContext} from "../../context/AuthContext";
import {ExitToApp, History, Create} from "@material-ui/icons";

function Headbar() {
    const {user} = useContext(AuthContext);

    const performSignOut = () => {
        let defaultContext = {
            user: null,
            isFetching: false,
            error: false
        }
        localStorage.setItem("auth_state", JSON.stringify(defaultContext));
        window.location.reload();
    }

    return (
        <>
        <Navbar bg="dark" expand="lg" variant="dark">
            <Container>
                <Navbar.Brand href="./home">
                    <img
                        src={Logo}
                        width="40"
                        height="40"
                        className="d-inline-block align-top"
                        alt="React Bootstrap logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                    <NavDropdown title={user.fullname} id="basic-nav-dropdown">
                        <NavDropdown.Item href="/attempts">
                            <History></History> Lịch sử  
                        </NavDropdown.Item>
                        {user.role === 1 &&
                        <NavDropdown.Item href="/create">
                            <Create></Create> Tạo quiz 
                        </NavDropdown.Item>
                        } 
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#" onClick={() => performSignOut()}>
                            <ExitToApp></ExitToApp> Đăng xuất
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        </>        
    )
}

export default Headbar
