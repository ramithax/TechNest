import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./Pages/AdminLayout";

import AdminDashboard from "./components/Admin-Dashboard";

import { LoginPage } from "./Pages/LoginPage";
import { ProductPage } from "./Pages/ProductsPage";
import { OrdersPage } from "./Pages/OrdersPage";
import { CustomerPage } from "./Pages/CustomersPage";
import { RepairPage } from "./Pages/RepairsPage";
import { AddProductPage } from "./Pages/AddProductPage";
import { UpdateProductPage } from "./Pages/UpdateProductPage";
import { PcBuildRequestsPage } from "./Pages/PcBuildRequestsPage";

import PcBuildsPage from "./Pages/Pcbuilder";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster />

        <Routes>

          {/* Login */}
          <Route path="/" element={<LoginPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>

            {/* Dashboard */}
            <Route
              index
              element={<AdminDashboard />}
            />

            {/* Products */}
            <Route
              path="products"
              element={<ProductPage />}
            />

            <Route
              path="add-product"
              element={<AddProductPage />}
            />

            <Route
              path="edit-product/:productId"
              element={<UpdateProductPage />}
            />

            {/* Orders */}
            <Route
              path="orders"
              element={<OrdersPage />}
            />

            {/* Customers */}
            <Route
              path="customers"
              element={<CustomerPage />}
            />

            {/* Repairs */}
            <Route
              path="repairs"
              element={<RepairPage />}
            />

            {/* PC Builder */}
            <Route
              path="pcbuilder"
              element={<PcBuildsPage />}
            />

            {/* PC Build Requests */}
            <Route
              path="pc-builder-requests"
              element={<PcBuildRequestsPage />}
            />

          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
