// src/LoginPage.js
import React, { useState } from "react";
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { authTokenState, userState } from "./recoilState";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuthToken = useSetRecoilState(authTokenState);
  const setUser = useSetRecoilState(userState);

  const [error, setError] = useState("");
  const [userType, setUserType] = useState("investor");
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        ...userDetails,
        user_type: userType,
      });
      setAuthToken(resp.data.token);
      setUser(userDetails.email);
      setError("");
      navigate(`/dashboard/${userType}`);
    } catch (error) {
      console.error(error.response);
      setError(error.response.data.message);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: "auto", marginTop: 50 }}>
      <CardContent>
        <FormControl component="fieldset">
          <FormLabel component="legend">User Type</FormLabel>
          <RadioGroup
            row
            aria-label="user-type"
            name="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <FormControlLabel
              value="investor"
              control={<Radio />}
              label="Investor"
            />
            <FormControlLabel
              value="startup"
              control={<Radio />}
              label="Startup"
            />
          </RadioGroup>
        </FormControl>

        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            <TextField
              style={{ margin: 10 }}
              label="Email"
              name="email"
              type="email"
              value={userDetails.email}
              onChange={handleChange}
            />
            <TextField
              style={{ margin: 10 }}
              label="Password"
              name="password"
              type="password"
              value={userDetails.password}
              onChange={handleChange}
            />
            <div style={{ color: "red" }}>{error}</div>
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: 10 }}
          >
            Login
          </Button>
        </form>
        <br />
        <Button onClick={() => navigate("/signup")}> SignUp</Button>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
