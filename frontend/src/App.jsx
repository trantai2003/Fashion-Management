import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";

import UserList from "./pages/admin/UserList";
import UserDetailAdmin from "@/pages/admin/UserDetailAdmin.jsx";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UserList />} />
          <Route path="users/:id" element={<UserDetailAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
