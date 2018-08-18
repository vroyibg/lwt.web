import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import LoginForm from "../forms/LoginForm";
import { login } from "../../actions/auth";

class LoginPage extends React.Component {
  state = {};

  submit = data => {
    this.props.login(data);
  };

  render() {
    return (
      <div>
        <h1>Login Page</h1>
        <LoginForm submit={this.submit}/>
      </div>
    );
  }
}

LoginPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  login: PropTypes.func.isRequired
};

export default connect(
  null,
  { login }
)(LoginPage);
