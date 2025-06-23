import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaShoppingBag, FaChartLine, FaWallet, FaUser } from "react-icons/fa";

export default function Navbar() {
  const { pathname } = useLocation();

  const navItems = [
    { to: "/home", label: "Home", icon: <FaHome /> },
    { to: "/orders", label: "Orders", icon: <FaShoppingBag /> },
    { to: "/market", label: "Market", icon: <FaChartLine /> },
    { to: "/assets", label: "Assets", icon: <FaWallet /> },
    { to: "/account", label: "Account", icon: <FaUser /> },
  ];

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-around",
      backgroundColor: "#ffffff",
      borderTop: "1px solid #ccc",
      padding: "8px 0",
      boxShadow: "0 -2px 5px rgba(0,0,0,0.05)",
      zIndex: 999
    }}>
      {navItems.map(({ to, label, icon }) => (
        <Link key={to} to={to} style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          fontSize: "12px",
          color: pathname === to ? "#f5a623" : "#333"
        }}>
          <div style={{ fontSize: 18 }}>{icon}</div>
          {label}
        </Link>
      ))}
    </nav>
  );
}