import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import { CartProvider } from "@/context/CartContext";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <CartProvider>
        <HashRouter>
          <ErrorBoundary>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/count/a=a/adps" element={<AdminLoginPage />} />
                <Route path="/count/a=a/adps/dashboard" element={<AdminOrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" richColors closeButton />
          </ErrorBoundary>
        </HashRouter>
      </CartProvider>
    </div>
  );
}

export default App;
