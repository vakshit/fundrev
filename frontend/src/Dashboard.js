import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authTokenState, userState } from "./recoilState";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Button,
  Input,
  Card,
  CardContent,
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  CardActions,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate } from "react-router-dom";

const StartupDashboard = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [investors, setInvestors] = useState(null);
  const authToken = useRecoilValue(authTokenState);
  const user = useRecoilValue(userState);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      try {
        // POST request to your server endpoint to handle CSV processing
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: authToken,
            },
          }
        );
        const data = response.data;
        setChartData(`${process.env.REACT_APP_API_URL}/static/${data}.png`);
      } catch (error) {
        // Handle error
        console.error("Error uploading file:", error);
      }
    }
  };

  useEffect(() => {
    const fetchDbUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/startup/investors`,
          {
            headers: {
              Authorization: authToken,
            },
          }
        );
        setInvestors(response.data.investors);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchDbUser();
  }, [authToken]);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            ></IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welcome {user}
            </Typography>
            <Button color="inherit" onClick={() => navigate("/")}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Card style={{ maxWidth: 800, margin: "auto", marginTop: "40" }}>
        <CardContent>
          {investors && (
            <>
              <Typography variant="h5" component="div">
                Investors interested
              </Typography>
              <Typography variant="h6">
                {investors.map((investor, index) => (
                  <div key={index}>{investor}</div>
                ))}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card style={{ maxWidth: 800, margin: "auto", marginTop: "40" }}>
          <CardContent>
            <Input type="file" onChange={handleFileChange} />
            <Button onClick={handleFileUpload}>Update Sales</Button>
            <br />
            <br />
            <DatePicker
              label={"start date"}
              value={startDate}
              onChange={(e) => setStartDate(e)}
            />
            <DatePicker
              label={"end date"}
              value={endDate}
              onChange={(e) => setEndDate(e)}
            />
            {chartData && (
              <img src={chartData} alt="Bar Chart" style={{ width: "100vh" }} />
            )}
          </CardContent>
        </Card>
      </LocalizationProvider>
    </div>
  );
};

const InvestorDashboard = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const authToken = useRecoilValue(authTokenState);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/company/list`,
          {
            headers: {
              Authorization: authToken,
            },
          }
        );
        setCompanyInfo(response.data);
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };

    fetchCompanyInfo();
  }, [authToken]);

  const interestHandler = async (companyId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/investor/interested`,
        { startup_id: companyId },
        {
          headers: {
            Authorization: authToken,
          },
        }
      );
    } catch (error) {
      console.error("Error posting interest:", error);
    }
  };

  return (
    <div>
      {companyInfo && (
        <div style={{ margin: 40 }}>
          {companyInfo.map((company, index) => (
            <Card sx={{ maxWidth: 400 }} key={index}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {company.name}
                </Typography>
                <Typography variant="body2">
                  {company.description}
                  <br />
                  {company.revenue}
                </Typography>
                <CardActions style={{ flexDirection: "column-reverse" }}>
                  <Button
                    size="small"
                    onClick={() => {
                      interestHandler(company.id);
                    }}
                  >
                    Interested
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { StartupDashboard, InvestorDashboard };
