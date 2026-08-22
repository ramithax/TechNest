import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./Pages/AdminLayout";
import AdminDashboard from "./components/Admin-Dashboard";
import { LoginPage } from "./Pages/LoginPage";
import { ProductPage } from "./Pages/ProductsPage";
import { OrderPage } from "./Pages/OrdersPage";
import { CustomerPage } from "./Pages/CustomersPage";
import { RepairPage } from "./Pages/RepairsPage";
import { AddProductPage } from "./Pages/AddProductPage";
import { Toaster } from "@/components/ui/sonner";
import { UpdateProductPage } from "./Pages/UpdateProductPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>

        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>

          {/* /admin */}
          <Route index element={<AdminDashboard />} />

          {/* Add these when the pages are created */}
          <Route path="products" element={<ProductPage />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="repairs" element={<RepairPage />} />
          <Route path="add-product" element={<AddProductPage />} />
          <Route path="edit-product/:productId" element={<UpdateProductPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;