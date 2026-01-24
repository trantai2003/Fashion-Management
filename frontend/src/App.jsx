import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Warehouse from "./pages/warehouse/Warehouse";

import AddUser from "@/pages/admin/AddUser.jsx";
import UserList from "./pages/admin/UserList";
import UserDetailAdmin from "@/pages/admin/UserDetailAdmin.jsx";
import ResetUserPassword from "@/pages/admin/ResetUserPassword.jsx";
import UserPermissionEdit from "@/pages/admin/EditUserRole.jsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AdminLayout from "@/components/layout/AdminLayout.jsx";

import ColorSizeManagement from "@/pages/admin/ColorSizeManagement.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UserList />} />
          <Route path="users/:id" element={<UserDetailAdmin />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/:id/reset-password" element={<ResetUserPassword />} />
          <Route path="users/:id/edit-role" element={<UserPermissionEdit />} />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="attributes" element={<ColorSizeManagement />} />
        </Route>
        <Route path="*" element={<div className="flex items-center justify-center h-screen text-xl font-bold">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}