import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router basename="/crypto-exchange">
      <Navbar />
      <div style={{ paddingBottom: "60px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
