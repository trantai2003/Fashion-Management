import { BrowserRouter, Routes, Route } from "react-router-dom";
import BackofficeLayout from "@/components/backoffice/BackofficeLayout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Warehouse from "./pages/warehouse/Warehouse";
import ChatLieuList from "./pages/attribute/ChatLieuList";
import ChatLieuDetail from "./pages/attribute/ChatLieuDetail";
import ChatLieuDetailView from "./pages/attribute/ChatLieuDetailView";
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
import ColorSizeManagement from "@/pages/attribute/ColorSizeManagement.jsx";
import PhieuNhapKhoList from "./pages/receipt/PhieuNhapKhoList";
import PhieuNhapKhoCreate from "./pages/receipt/PhieuNhapKhoCreate";
import PhieuNhapKhoDetail from "./pages/receipt/PhieuNhapKhoDetail.jsx";
import KhaiBaoLo from "./pages/receipt/KhaiBaoLo.jsx";
import PhieuXuatKhoList from "./pages/issue/PhieuXuatKhoList.jsx";
import PurchaseOrderDetail from "./pages/order/PurchaseOrderDetail.jsx";
import PurchaseOrder from "./pages/order/PurchaseOrder.jsx";
import PurchaseRequest from "./pages/order/PurchaseRequest.jsx";
import PurchaseOrderCreate from "./pages/order/PurchaseOrderCreate.jsx";
import PurchaseOrderPayment from "./pages/order/PurchaseOrderPayment.jsx";
import SendQuotationRequest from "./pages/order/SendQuotationRequest.jsx";
import SkuBuilder from "./pages/product/SkuBuilder";
import PhieuXuatKhoCreate from "./pages/issue/PhieuXuatKhoCreate.jsx";
import PhieuXuatKhoDetail from "./pages/issue/PhieuXuatKhoDetail.jsx";
import PhieuXuatKhoView from "./pages/issue/PhieuXuatKhoView.jsx";
import PickLot from "./pages/issue/PickLot.jsx";
import QuoteSuccess from "./pages/supplier/pages/Quotesuccess.jsx";
import SupplierQuotation from "./pages/supplier/pages/Supplierquotation.jsx";
import SupplierLogin from "./pages/supplier/pages/Supplierlogin.jsx";
import KhachHangPage from "./pages/customer/KhachHangPage";
import DanhMucQuanAoTree from "./pages/danh-muc-quan-ao/DanhMucQuanAoTree.jsx";
import PhieuChuyenKhoList from "./pages/chuyenKhoNoiBo/PhieuChuyenKhoList";
import KhachHangDetails from "./pages/customer/KhachHangDetails";
import KhachHangEdit from "./pages/customer/KhachHangEdit";
import ProductAttributeHub from "@/pages/attribute/ProductAttributeHub";
import DonBanHangList from "./pages/sales-orders/DonBanHangList";
import DonBanHangDetail from "./pages/sales-orders/DonBanHangDetail";
import DonBanHangInvoice from "./pages/sales-orders/DonBanHangInvoice";
import DonBanHangCreate from "./pages/sales-orders/DonBanHangCreate";
import ProductDetail from "./pages/product/components/product/ProductDetail";
import PhieuChuyenKhoDetail from "./pages/chuyenKhoNoiBo/PhieuChuyenKhoDetail";
import PhieuChuyenKhoCreate from "./pages/chuyenKhoNoiBo/PhieuChuyenKhoCreate";
import StockTakeList from "./pages/stock-take/StockTakeList";
import StockTakeCreate from "./pages/stock-take/StockTakeCreate";
import StoreLayout from "@/components/store/StoreLayout";
import StoreHome from "./pages/store/StoreHome";
import ProductCategory from "./pages/store/ProductCategory";
import ProductSearch from "./pages/store/ProductSearch";
import PublicProductDetail from "./pages/store/PublicProductDetail";
import BaoCaoDoanhThu from "./pages/bao-cao/BaoCaoDoanhThu";
import KhachHangReport from "./pages/bao-cao/KhachHangReport";
import NhatKyNhapXuat from "./pages/bao-cao/NhatKyNhapXuat";
import PhieuNhapKhoPrint from "./pages/receipt/PhieuNhapKhoPrint";
import PhieuXuatKhoPrint from "./pages/issue/PhieuXuatKhoPrint";
import Dashboard from "@/pages/dashboard/Dashboard";
import FashionFlowHomepage from "./pages/HomePageInternal";
import NotFound404 from "./pages/page-error/NotFound404";
import TonKhoTongQuan from "./pages/bao-cao/TonKhoTongQuan";
import ApplicationRequestManagement from "./pages/purchase-oder-create-req/ApplicationRequestManagement";
import LichSuGiaoDichKhoList from "./pages/lich-su-giao-dich-kho/LichSuGiaoDichKhoList";
import QuotationRequestList from "./pages/order/QuotationRequestList";
import QuotationRequestCreate from "./pages/order/QuotationRequestCreate";
import PurchaseOrderCreateManual from "./pages/order/PurchaseOrderCreateManual";
import BaoGiaList from "./pages/sales-orders/Bao-gia/BaoGiaList";
import BaoGiaCreate from "./pages/sales-orders/Bao-gia/BaoGiaCreate";
import BaoGiaDetail from "./pages/sales-orders/Bao-gia/BaoGiaDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<FashionFlowHomepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/supplier/quotation" element={<SupplierQuotation />} />
        <Route path="/quote-success" element={<QuoteSuccess />} />
        <Route path="/supplier/login" element={<SupplierLogin />} />
        <Route path="/user/:id" element={<UserDetail />} />

        {/* ========== STOREFRONT ROUTES (CÓ NAVBAR + FOOTER CỦA KHÁCH) ========== */}
        <Route element={<StoreLayout />}>
          <Route path="/store" element={<StoreHome />} />
          <Route path="/category/:id" element={<ProductCategory />} />
          <Route path="/search" element={<ProductSearch />} />
          <Route path="/product/:id" element={<PublicProductDetail />} />
        </Route>

        {/* ========== BACKOFFICE ROUTES (CÓ SIDEBAR + HEADER) ========== */}
        <Route element={<BackofficeLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* User management */}
          <Route path="/users" element={<ViewUserListByAdmin />} />
          <Route path="/users/add" element={<AddUserByAdmin />} />
          <Route path="/users/:id" element={<ViewUserDetailByAdmin />} />
          <Route
            path="/users/:id/reset-password"
            element={<ResetUserPasswordByAdmin />}
          />
          <Route
            path="/users/:id/edit-role"
            element={<EditUserRoleByAdmin />}
          />

          {/* Attributes */}
          <Route path="/attribute" element={<ColorSizeManagement />} />
          <Route path="/attributes" element={<ProductAttributeHub />} />

          {/* Product */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/sku-builder" element={<SkuBuilder />} />
          <Route path="/danh-muc-quan-ao" element={<DanhMucQuanAoTree />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          {/* Warehouse */}
          <Route path="/warehouse" element={<Warehouse />} />

          {/* Material */}
          {/* <Route path="/material" element={<ChatLieuList />} /> */}
          {/* <Route path="/material/new" element={<ChatLieuDetail />} />
          <Route path="/material/view/:id" element={<ChatLieuDetailView />} />
          <Route path="/material/:id" element={<ChatLieuDetail />} /> */}

          {/* Purchase Order */}
          <Route path="/purchase-requests" element={<PurchaseRequest />} />
          <Route path="/purchase-orders" element={<PurchaseOrder />} />
          <Route path="/purchase-requests/create" element={<PurchaseOrderCreate />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
          <Route path="/purchase-orders/:id/payment" element={<PurchaseOrderPayment />} />
          <Route path="/purchase-requests/:id/gui-bao-gia" element={<SendQuotationRequest />} />
          <Route path="/quotation-requests" element={<QuotationRequestList />} />
          <Route path="/quotation-requests/create" element={<QuotationRequestCreate />} />
          <Route path="/purchase-orders/create" element={<PurchaseOrderCreateManual />} />

          {/* Supplier */}
          <Route path="/supplier" element={<SupplierList />} />
          <Route path="/supplier/new" element={<SupplierDetail />} />
          <Route path="/supplier/view/:id" element={<SupplierDetailView />} />
          <Route path="/supplier/:id" element={<SupplierDetail />} />

          {/* Customer */}
          <Route path="/customers" element={<KhachHangPage />} />
          <Route path="/customers/:id" element={<KhachHangDetails />} />
          <Route path="/customers/:id/edit" element={<KhachHangEdit />} />

          {/* Receipt*/}
          <Route path="/goods-receipts/create" element={<PhieuNhapKhoCreate />} />
          <Route path="/goods-receipts" element={<PhieuNhapKhoList />} />
          <Route path="/goods-receipts/:id" element={<PhieuNhapKhoDetail />} />
          <Route path="/goods-receipts/:id/print" element={<PhieuNhapKhoPrint />} />
          <Route path="/goods-receipts/:phieuNhapKhoId/lot-input/:bienTheSanPhamId" element={<KhaiBaoLo />} />

          {/* Issue */}
          <Route path="/goods-issues" element={<PhieuXuatKhoList />} />
          <Route path="/goods-issues/create" element={<PhieuXuatKhoCreate />} />
          <Route path="/goods-issues/:id" element={<PhieuXuatKhoDetail />} />
          <Route path="/goods-issues/:phieuXuatKhoId/pick-lot/:chiTietPhieuXuatKhoId" element={<PickLot />} />
          <Route path="/goods-issues/:id/print" element={<PhieuXuatKhoPrint />} />
          <Route path="/goods-issues/:id/view" element={<PhieuXuatKhoView />} />

          {/* Sales-orders */}
          <Route path="/sales-orders" element={<DonBanHangList />} />
          <Route path="/sales-orders/:id" element={<DonBanHangDetail />} />
          <Route path="/sales-orders/:id/invoice" element={<DonBanHangInvoice />} />
          <Route path="/sales-orders/create" element={<DonBanHangCreate />} />
          <Route path="/sales-quotations" element={<BaoGiaList />} />
          <Route path="/sales-quotations/create" element={<BaoGiaCreate />} />
          <Route path="/sales-quotations/:id" element={<BaoGiaDetail />} />

          {/* Chuyen kho noi bo */}
          <Route path="/transfer-tickets" element={<PhieuChuyenKhoList />} />
          <Route path="/transfer-tickets/create" element={<PhieuChuyenKhoCreate />} />
          <Route path="/transfer-tickets/:id" element={<PhieuChuyenKhoDetail />} />

          {/* Kiểm kê kho hàng*/}
          <Route path="/stock-take" element={<StockTakeList />} />
          <Route path="/stock-take/new" element={<StockTakeCreate />} />
          <Route path="/stock-take/:id" element={<StockTakeCreate />} /> {/* Để hoàn thành kiểm kê */}

          <Route path="/bao-cao/doanh-thu" element={<BaoCaoDoanhThu />} />
          <Route path="/bao-cao/khach-hang" element={<KhachHangReport />} />
          <Route path="/bao-cao/xuat-nhap" element={<NhatKyNhapXuat />} />
          <Route path="/bao-cao/ton-kho" element={<TonKhoTongQuan />} />

          <Route path="/duyet-don-hang" element={<ApplicationRequestManagement />} />

          {/*Lịch sử giao dịch kho */}
          <Route path="/lich-su-giao-dich-kho" element={<LichSuGiaoDichKhoList />} />

        </Route>

        {/* ========== 404 ========== */}
        <Route
          path="*"
          element={<NotFound404 />}
        />
      </Routes>
    </BrowserRouter>
  );
}
