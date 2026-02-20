import React from "react";

import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useNavigate();

    const isAuthenticated = () => {
      if (localStorage.getItem("token")) {
        //we can add one more layer of authentication like validating the token
        return true;
      }
      return false;
    };
    useEffect(() => {
      if (!isAuthenticated()) {     //if !authenticated
        router("/auth");
      }
    }, []);
    return <WrappedComponent {...props} />;  //if authenticated 
  };
  return AuthComponent;
};


export default withAuth;