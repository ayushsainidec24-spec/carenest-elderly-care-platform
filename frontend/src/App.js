import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/DashboardModern";
import Caregivers from "./pages/Caregivers";
import Medication from "./pages/Medication";
import Health from "./pages/Health";
import SOS from "./pages/SOS";
import BookCaregiver from "./pages/BookCaregiver";
import Telemedicine from "./pages/Telemedicine";
import Family from "./pages/Family";
import { LoginRedesign } from "./components/LoginRedesign";
import { SignupRedesign } from "./components/SignupRedesign";
import { getCurrentUser } from "./utils/auth";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const isAuthenticated = Boolean(getCurrentUser());

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginRedesign />
            }
          />
          <Route path="/login" element={<LoginRedesign />} />
          <Route path="/signup" element={<SignupRedesign />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/book" element={<BookCaregiver />} />
                  <Route path="/telemedicine" element={<Telemedicine />} />
                  <Route path="/caregivers" element={<Caregivers />} />
                  <Route path="/medication" element={<Medication />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/sos" element={<SOS />} />
                  <Route path="/family" element={<Family />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
