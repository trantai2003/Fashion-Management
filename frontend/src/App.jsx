import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/admin/adminLayout/AdminLayout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Warehouse from "./pages/warehouse/Warehouse";

// import AddUserByAdmin from "./pages/admin/AddUserByAdmin"; "@/pages/admin/AddUserByAdmin.jsx";
import ViewUserListByAdmin from "./pages/admin/ViewUserListByAdmin";
import ViewUserDetailByAdmin from "@/pages/admin/ViewUserDetailByAdmin.jsx";
import ResetUserPasswordByAdmin from "@/pages/admin/ResetUserPasswordByAdmin.jsx";
import EditUserRoleByAdmin from "@/pages/admin/EditUserRoleByAdmin.jsx";
import DashboardByAdmin from "@/pages/admin/DashboardByAdmin.jsx";
// import AddUser from "@/pages/admin/AddUser.jsx";
// import UserList from "./pages/admin/UserList";
// import UserDetailAdmin from "@/pages/admin/UserDetailAdmin.jsx";
// import ResetUserPassword from "@/pages/admin/ResetUserPassword.jsx";
// import UserPermissionEdit from "@/pages/admin/EditUserRole.jsx";
// import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import ProductList from "./pages/product";

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
        <Route path="/products" element={<ProductList />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<ViewUserListByAdmin />} />
          <Route path="users/:id" element={<ViewUserDetailByAdmin />} />
          {/* <Route path="users/add" element={<AddUserByAdmin />} /> */}
          <Route path="users/:id/reset-password" element={<ResetUserPasswordByAdmin />} />
          <Route path="users/:id/edit-role" element={<EditUserRoleByAdmin />} />
          <Route path="dashboard" element={<DashboardByAdmin />} />
          {/* <Route path="users" element={<UserList />} /> */}
          {/* <Route path="users/:id" element={<UserDetailAdmin />} /> */}
          {/* <Route path="users/add" element={<AddUser />} /> */}
          {/* <Route path="users/:id/reset-password" element={<ResetUserPassword />} /> */}
          {/* <Route path="users/:id/edit-role" element={<UserPermissionEdit />} /> */}
          {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}