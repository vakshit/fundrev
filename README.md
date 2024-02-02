# Frontend

- Created a new React app using `npx create-react-app frontend`
- Used Axios to make API calls to the backend
- Used React Router to navigate between different pages
- Used Material UI for styling
- Used RecoilJS for global state management.

## Logic

- Application has a Signup page, which has option to signup as an investor or a startup. The form fields change as per the selection.
- After signup, user is redirected to the login page.
- After login, the token is created, stored in the recoil persistant state and is redirected to the dashboard, which is different for investors and startups.
- Investors can see the list of startups and can invest in them. It has a button to show interst.
- Startups can see the list of investors that have shown interest in them. Also they can upload the sales csv which has per month sales data.
- Investor cannot see the startup dashboard and vice versa.

## To be implemented

- RBAC control to allow only the authorized investors to access the sales data of the startups.
- Pagination for the list of startups and investors.

# Backend

- Flask application using MondoDB as database.
- Used Flask-JWT-Extended for token based authentication, creating a decorator to check if the user is logged in.
- Used Flask-CORS to allow cross origin requests.
- Used Flask-PyMongo to connect to the MongoDB database.
- Created 2 collections, one for investors and one for startups.
- Investor Schema:
  - Email
  - Password
- Startup Schema:
  - Email
  - Password
  - Name
  - Description
  - Investors: List of investors that have shown interest in the startup.
- Used Pandas to read the csv file and matplotlib to plot the graph for the sales data.

## Logic

- Created a signup and login route for both investors and startups.
- Upload route to get the chart generated with the given csv data and the time range.
- Show interest route to add the investor to the list of investors that have shown interest in the startup.
- Get startups route to get the list of startups.
- Get investors route to get the list of investors interested in the startup.

## To be implemented

- Modified Schema and tables to include the sales data. And a probable shift to postgreSQL from MongoDB to have a better structure for the data.
- Investor
  - Name
  - Email
  - Password
  - Investments: List of startups that the investor has invested in.
- Startup
  - Email
  - Password
  - Name
  - Description
  - Revenue
- Sales Data
  - ID of the startup
  - Path to the csv file or URL
- Implement storage to s3 of the sales data to have better access control and fault tolerance.
- Usage of ory stack for access control to the sales data of the startups by the investors.
