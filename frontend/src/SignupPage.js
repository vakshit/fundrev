// src/SignupPage.js
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
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("investor");
  const [investorDetails, setInvestorDetails] = useState({
    email: "",
    password: "",
  });
  const [startupDetails, setStartupDetails] = useState({
    email: "",
    password: "",
    companyName: "",
    businessDescription: "",
    revenue: "",
  });

  const handleInvestorChange = (e) => {
    setInvestorDetails({ ...investorDetails, [e.target.name]: e.target.value });
  };

  const handleStartupChange = (e) => {
    setStartupDetails({ ...startupDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userType === "investor") {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
          ...investorDetails,
          user_type: userType,
        });
      } catch (error) {
        console.error(error.response);
      }
    } else {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
          ...startupDetails,
          user_type: userType,
        });
      } catch (error) {
        console.error(error.response);
      }
    }
    navigate("/");
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
          {userType === "investor" ? (
            <div className="form-fields">
              <TextField
                style={{ margin: 10 }}
                label="Email"
                name="email"
                type="email"
                value={investorDetails.email}
                onChange={handleInvestorChange}
              />
              <TextField
                style={{ margin: 10 }}
                label="Password"
                name="password"
                type="password"
                value={investorDetails.password}
                onChange={handleInvestorChange}
              />
            </div>
          ) : (
            <div className="form-fields">
              <TextField
                style={{ margin: 10 }}
                label="Email"
                name="email"
                type="email"
                value={startupDetails.email}
                onChange={handleStartupChange}
              />
              <TextField
                style={{ margin: 10 }}
                label="Password"
                name="password"
                type="password"
                value={startupDetails.password}
                onChange={handleStartupChange}
              />
              <TextField
                style={{ margin: 10 }}
                label="Company Name"
                name="companyName"
                value={startupDetails.companyName}
                onChange={handleStartupChange}
              />
              <TextField
                style={{ margin: 10 }}
                label="Business Description"
                name="businessDescription"
                value={startupDetails.businessDescription}
                onChange={handleStartupChange}
              />
              <TextField
                style={{ margin: 10 }}
                label="Revenue"
                name="revenue"
                value={startupDetails.revenue}
                onChange={handleStartupChange}
              />
            </div>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: 10 }}
          >
            Sign Up
          </Button>
        </form>
        <br />
        <Button onClick={() => navigate("/")}> Login</Button>
      </CardContent>
    </Card>
  );
};

export default SignupPage;
