import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CatalogPage from "@/pages/catalog-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import OrderConfirmationPage from "@/pages/order-confirmation-page";
import OrdersPage from "@/pages/orders-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import DesignStudioPage from "@/pages/design-studio-page";
import AdminPage from "@/pages/admin-page";
import ProductDetailPage from "@/pages/product-detail-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/catalog" component={CatalogPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-confirmation/:orderId" component={OrderConfirmationPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/design-studio" component={DesignStudioPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
