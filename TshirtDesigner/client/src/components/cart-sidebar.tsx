import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

export function CartSidebar({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { cartItems, cartTotal, removeFromCartMutation, updateCartMutation } = useCart();
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState("");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const getProduct = (productId: string | null) => {
    if (!productId) return null;
    return products.find(p => p.id === productId);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(itemId);
    } else {
      updateCartMutation.mutate({
        id: itemId,
        updates: { quantity: newQuantity }
      });
    }
  };

  const handleViewCart = () => {
    setLocation("/cart");
  };

  if (!user) {
    return children;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Shopping Cart</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-empty-cart">Your cart is empty</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const product = getProduct(item.productId);
                const price = item.customPrice ? parseFloat(item.customPrice) : parseFloat(product?.basePrice || "25.99");

                return (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg" data-testid={`cart-item-${item.id}`}>
                    <img
                      src={product?.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={product?.name || "Custom Design"}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground" data-testid={`text-product-name-${item.id}`}>
                        {product?.name || "Custom Design"}
                      </h3>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm text-muted-foreground">Color: {item.color}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-card-foreground" data-testid={`text-price-${item.id}`}>
                        ${(price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive/80 mt-1"
                        onClick={() => removeFromCartMutation.mutate(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-border pt-6 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between text-card-foreground">
                <span>Subtotal:</span>
                <span data-testid="text-subtotal">${cartTotal.toFixed(2)}</span>
              </div>
              
              {/* Coupon Code */}
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  data-testid="input-coupon"
                />
                <Button variant="secondary" data-testid="button-apply-coupon">
                  Apply
                </Button>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-semibold text-card-foreground">
                <span>Total:</span>
                <span data-testid="text-total">${cartTotal.toFixed(2)}</span>
              </div>

              {/* View Cart Button */}
              <Button
                className="w-full"
                onClick={handleViewCart}
                data-testid="button-view-cart"
              >
                View Cart
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
