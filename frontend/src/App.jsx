import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import Verify from "./pages/Verify.jsx";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      <nav>
        <h1>⛓ CertVerifier</h1>
        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>Dashboard</button>
        <button className={page === "register" ? "active" : ""} onClick={() => setPage("register")}>Register</button>
        <button className={page === "verify" ? "active" : ""} onClick={() => setPage("verify")}>Verify</button>
      </nav>
      <main>
        {page === "dashboard" && <Dashboard onRegister={() => setPage("register")} />}
        {page === "register" && <Register onDone={() => setPage("dashboard")} />}
        {page === "verify" && <Verify />}
      </main>
    </>
  );
}
