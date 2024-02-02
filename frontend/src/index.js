import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import { StartupDashboard, InvestorDashboard } from "./Dashboard";
import { RecoilRoot } from "recoil";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/dashboard/startup",
    element: <StartupDashboard />,
  },
  {
    path: "/dashboard/investor",
    element: <InvestorDashboard />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RecoilRoot>
    <React.StrictMode>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </React.StrictMode>
  </RecoilRoot>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
