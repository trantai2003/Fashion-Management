import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import AdminLayout from "./components/admin/adminLayout/AdminLayout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Warehouse from "./pages/warehouse/Warehouse";
import ChatLieuList from "./pages/material/ChatLieuList";
import ChatLieuDetail from "./pages/material/ChatLieuDetail";
import ChatLieuDetailView from "./pages/material/ChatLieuDetailView";
import SupplierList from "./pages/supplier/SupplierList";
import SupplierDetail from "./pages/supplier/SupplierDetail";
import SupplierDetailView from "./pages/supplier/SupplierDetailView";
import ProductList from "./pages/product";
import AddUserByAdmin from "@/pages/admin/AddUserByAdmin.jsx";
import ViewUserListByAdmin from "./pages/admin/ViewUserListByAdmin";
import ViewUserDetailByAdmin from "@/pages/admin/ViewUserDetailByAdmin.jsx";
import ResetUserPasswordByAdmin from "@/pages/admin/ResetUserPasswordByAdmin.jsx";
import EditUserRoleByAdmin from "@/pages/admin/EditUserRoleByAdmin.jsx";
import DashboardByAdmin from "@/pages/admin/DashboardByAdmin.jsx";
import ColorSizeManagement from "@/pages/admin/ColorSizeManagement.jsx";
export default function App() {
  return (
    <BrowserRouter>
      {/* Toaster – tạm thời đặt ở App */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3500}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/material" element={<ChatLieuList />} />
        <Route path="/material/new" element={<ChatLieuDetail />} />
        <Route path="/material/view/:id" element={<ChatLieuDetailView />} />
        <Route path="/material/:id" element={<ChatLieuDetail />} />

        <Route path="/supplier" element={<SupplierList />} />
        <Route path="/supplier/new" element={<SupplierDetail />} />
        <Route path="/supplier/view/:id" element={<SupplierDetailView />} />
        <Route path="/supplier/:id" element={<SupplierDetail />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<ViewUserListByAdmin />} />
          <Route path="users/:id" element={<ViewUserDetailByAdmin />} />
          <Route path="users/add" element={<AddUserByAdmin />} />
          <Route path="users/:id/reset-password" element={<ResetUserPasswordByAdmin />} />
          <Route path="users/:id/edit-role" element={<EditUserRoleByAdmin />} />
          <Route path="dashboard" element={<DashboardByAdmin />} />
          <Route path="attributes" element={<ColorSizeManagement />} />
        </Route>
        <Route path="*" element={<div className="flex items-center justify-center h-screen text-xl font-bold">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
