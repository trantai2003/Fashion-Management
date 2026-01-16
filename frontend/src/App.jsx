import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import UserDetail from "./pages/UserDetail";
import UserList from "./pages/admin/UserList";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
