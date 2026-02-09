import { BrowserRouter, Routes, Route } from "react-router-dom";
import BackofficeLayout from "@/components/backoffice/BackofficeLayout";
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
import ColorSizeManagement from "@/pages/material/ColorSizeManagement.jsx";
import PhieuNhapKhoList from "./pages/receipt/PhieuNhapKhoList";
import PhieuNhapKhoCreate from "./pages/receipt/PhieuNhapKhoCreate";
import PhieuNhapKhoDetail from "./pages/receipt/PhieuNhapKhoDetail.jsx";
import KhaiBaoLo from "./pages/receipt/KhaiBaoLo.jsx";
import PhieuXuatKhoList from "./pages/issue/PhieuXuatKhoList.jsx";
import PurchaseOrderDetail from "./pages/order/history/Purchaseorderdetail.jsx";
import PurchaseOrder from "./pages/order/history/PurchaseOrder.jsx";
import SkuBuilder from "./pages/product/SkuBuilder";
import PhieuXuatKhoCreate from "./pages/issue/PhieuXuatKhoCreate.jsx";
export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/user/:id" element={<UserDetail />} />

        {/* ========== BACKOFFICE ROUTES (CÓ SIDEBAR + HEADER) ========== */}
        <Route element={<BackofficeLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardByAdmin />} />

          {/* User management */}
          <Route path="/users" element={<ViewUserListByAdmin />} />
          <Route path="/users/add" element={<AddUserByAdmin />} />
          <Route path="/admin/users/:id" element={<ViewUserDetailByAdmin />} />
          <Route
            path="/users/:id/reset-password"
            element={<ResetUserPasswordByAdmin />}
          />
          <Route
            path="/users/:id/edit-role"
            element={<EditUserRoleByAdmin />}
          />

          {/* Attributes */}
          <Route path="/attributes" element={<ColorSizeManagement />} />

          {/* Product */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/sku-builder" element={<SkuBuilder />} />

          {/* Warehouse */}
          <Route path="/warehouse" element={<Warehouse />} />

          {/* Material */}
          <Route path="/material" element={<ChatLieuList />} />
          <Route path="/material/new" element={<ChatLieuDetail />} />
          <Route path="/material/view/:id" element={<ChatLieuDetailView />} />
          <Route path="/material/:id" element={<ChatLieuDetail />} />

          {/* Purchase Order */}
          <Route path="/purchase-orders" element={<PurchaseOrder />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />

          {/* Supplier */}
          <Route path="/supplier" element={<SupplierList />} />
          <Route path="/supplier/new" element={<SupplierDetail />} />
          <Route path="/supplier/view/:id" element={<SupplierDetailView />} />
          <Route path="/supplier/:id" element={<SupplierDetail />} />

          {/* Receipt*/}
          <Route path="/goods-receipts/create" element={<PhieuNhapKhoCreate />} />
          <Route path="/goods-receipts" element={<PhieuNhapKhoList />} />
          <Route path="/goods-receipts/:id" element={<PhieuNhapKhoDetail />} />
          <Route path="/goods-receipts/:phieuNhapKhoId/lot-input/:bienTheSanPhamId" element={<KhaiBaoLo />} />

          {/* Issue */}
          <Route path="/goods-issues" element={<PhieuXuatKhoList />} />
          <Route path="/goods-issues/create" element={<PhieuXuatKhoCreate />} />
        </Route>

        {/* ========== 404 ========== */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-xl font-bold">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}