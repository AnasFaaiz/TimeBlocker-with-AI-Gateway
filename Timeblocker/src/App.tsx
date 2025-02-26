import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import Login from "./Components/Login_Page/Login";

const StyledApp = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
`;

const App: React.FC = () => {
  return (
    <StyledApp>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path="/signup" element={<Signup />} /> */}
        </Routes>
      </Router>
    </StyledApp>
  );
};

export default App;