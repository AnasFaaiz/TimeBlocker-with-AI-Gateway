import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import styled from "styled-components";
import Login from "./Components/Login_Page/Login";
import HomePage from "./Components/HomePage/HomePage";

const StyledApp = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
`;

const App: React.FC = () => {
  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  // Protected Route component
  const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/" replace />;
  };

  return (
    <StyledApp>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            } 
          />
          <Route 
            path="/homepage" 
            element={
              <ProtectedRoute element={<HomePage />} />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StyledApp>
  );
};

export default App;