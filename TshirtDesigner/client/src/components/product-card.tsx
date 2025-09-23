import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCartMutation, addToWishlistMutation, removeFromWishlistMutation, wishlistItems } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "black");

  const isInWishlist = wishlistItems.some(item => item.productId === product.id);

  const handleAddToCart = () => {
    if (!user) {
      // Redirect to auth page
      window.location.href = "/auth";
      return;
    }

    addToCartMutation.mutate({
      userId: user.id,
      productId: product.id,
      designId: null,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      customPrice: product.basePrice
    });
  };

  const handleWishlistToggle = () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(product.id);
    } else {
      addToWishlistMutation.mutate({
        userId: user.id,
        productId: product.id
      });
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="absolute top-4 right-4">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 bg-background/80 backdrop-blur rounded-full hover:bg-background"
            onClick={handleWishlistToggle}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`} />
          </Button>
        </div>
        {product.stock < 20 && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Low Stock
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-card-foreground mb-2 hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-card-foreground" data-testid={`text-product-price-${product.id}`}>
            ${product.basePrice}
          </span>
          <div className="flex items-center">
            <div className="flex text-yellow-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">(4.2)</span>
          </div>
        </div>
        
        {/* Quick Size and Color Selection */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">Size:</span>
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs border rounded ${selectedSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
                data-testid={`button-size-${size}-${product.id}`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">Color:</span>
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-4 h-4 rounded-full border-2 ${selectedColor === color ? 'border-primary' : 'border-border'}`}
                style={{ backgroundColor: color === 'black' ? '#000' : color === 'white' ? '#fff' : color }}
                data-testid={`button-color-${color}-${product.id}`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full"
          disabled={addToCartMutation.isPending}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
