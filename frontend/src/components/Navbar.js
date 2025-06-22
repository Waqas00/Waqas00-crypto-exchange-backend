import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/wallet">Wallet</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  );
}