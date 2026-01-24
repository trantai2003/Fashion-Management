import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Warehouse from "./pages/warehouse/Warehouse";
import ChatLieuList from "./pages/material/ChatLieuList";
import ChatLieuDetail from "./pages/material/ChatLieuDetail";
import SupplierList from "./pages/supplier/SupplierList";
import SupplierDetail from "./pages/supplier/SupplierDetail";

import AddUser from "@/pages/admin/AddUser.jsx";
import UserList from "./pages/admin/UserList";
import UserDetailAdmin from "@/pages/admin/UserDetailAdmin.jsx";
import ResetUserPassword from "@/pages/admin/ResetUserPassword.jsx";
import UserPermissionEdit from "@/pages/admin/EditUserRole.jsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";

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

                <Route path="/material" element={<ChatLieuList />} />
                <Route path="/material/new" element={<ChatLieuDetail />} />
                <Route path="/material/:id" element={<ChatLieuDetail />} />

                <Route path="/supplier" element={<SupplierList />} />
                <Route path="/supplier/new" element={<SupplierDetail />} />
                <Route path="/supplier/:id" element={<SupplierDetail />} />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="users" element={<UserList />} />
                    <Route path="users/add" element={<AddUser />} />
                    <Route path="users/:id" element={<UserDetailAdmin />} />
                    <Route path="users/:id/reset-password" element={<ResetUserPassword />} />
                    <Route path="users/:id/edit-role" element={<UserPermissionEdit />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
