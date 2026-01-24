import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import AdminLayout from "./components/layout/AdminLayout";
=======
>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Warehouse from "./pages/warehouse/Warehouse";
<<<<<<< HEAD

import AddUser from "@/pages/admin/AddUser.jsx";
import UserList from "./pages/admin/UserList";
import UserDetailAdmin from "@/pages/admin/UserDetailAdmin.jsx";
import ResetUserPassword from "@/pages/admin/ResetUserPassword.jsx";
import UserPermissionEdit from "@/pages/admin/EditUserRole.jsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
=======
import ColorSizeManagement from "./pages/ColorSizeManagement";

>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879
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
<<<<<<< HEAD
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UserList />} />
          <Route path="users/:id" element={<UserDetailAdmin />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/:id/reset-password" element={<ResetUserPassword />}/>
          <Route path="users/:id/edit-role" element={<UserPermissionEdit />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
=======
        <Route path="/catalog/attributes" element={<ColorSizeManagement />} />
>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879
      </Routes>
    </BrowserRouter>
  );
}