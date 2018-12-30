import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { logoutAction } from "../../Actions/UserAction";
import "./Header.css";

/**
 * Header
 */
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

   handleLogout(){
    const { logout } = this.props;
    logout();
  }
   render(){
    const { isLoggedIn, userName } = this.props;
    const menu= (
      <Menu>
        <Menu.Item>
          <Link to="/profile">Profile</Link>
        </Menu.Item>
        <Menu.Item>
          <Button className="logout-button" onClick={this.handleLogout}>
            Logout
          </Button>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className="header">
        <span className="left-menu menu">
          <Link to="/">LWT</Link>
          <Link to="/text">Text</Link>
        </span>
        <span className="right-menu menu">
          {isLoggedIn ? (
            <Dropdown overlay={menu}>
              <Link to="/profile">{userName}</Link>
            </Dropdown>
          ) : (
            <React.Fragment>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </React.Fragment>
          )}
        </span>
      </div>
    );
  }
}

const connectedHeader = connect(
  (state) => ({
    isLoggedIn: state.user.isLoggedIn,
    userName: state.user.userName
  }),
  {
    logout: logoutAction
  }
)(Header);

export { connectedHeader as Header };