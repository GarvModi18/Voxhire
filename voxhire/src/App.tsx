// App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Interview from "./pages/Interview";
import CodingInterview from "./pages/CodingInterview";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-dash" element={<AdminDashboard />} />
        <Route path="/interview/:id" element={<Interview />} />
        <Route path="/coding-interview" element={<CodingInterview />} />
      </Routes>
    </Router>
  );
};

export default App;
