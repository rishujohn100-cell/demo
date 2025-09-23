import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ReviewForm } from "@/components/review-form";
import { ReviewDisplay } from "@/components/review-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Heart, Star, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import { Product } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { addToCartMutation, addToWishlistMutation, removeFromWishlistMutation, wishlistItems } = useCart();
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const relatedProducts = allProducts
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4);

  const isInWishlist = product ? wishlistItems.some(item => item.productId === product.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CartSidebar>
          <Navigation />
        </CartSidebar>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <CartSidebar>
          <Navigation />
        </CartSidebar>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/catalog")} data-testid="button-back-to-catalog">
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  // Set default selections
  if (!selectedSize && product.sizes.length > 0) {
    setSelectedSize(product.sizes[0]);
  }
  if (!selectedColor && product.colors.length > 0) {
    setSelectedColor(product.colors[0]);
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!selectedSize || !selectedColor) {
      return;
    }

    addToCartMutation.mutate({
      userId: user.id,
      productId: product.id,
      designId: null,
      quantity,
      size: selectedSize,
      color: selectedColor,
      customPrice: product.basePrice
    });
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate("/auth");
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

  const productImages = [
    product.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
  ];

  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm breadcrumbs mb-8" data-testid="breadcrumb">
            <span className="text-muted-foreground">Home</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-muted-foreground">Catalog</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="img-product-main"
                />
              </div>
              <div className="flex space-x-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-border'}`}
                    data-testid={`button-image-${index}`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-product-title">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">(4.2 stars, 156 reviews)</span>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <p className="text-xl font-bold text-foreground mb-4" data-testid="text-product-price">
                  ${product.basePrice}
                </p>
                <p className="text-muted-foreground" data-testid="text-product-description">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Size</h3>
                <div className="flex space-x-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      data-testid={`button-select-size-${size}`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Color</h3>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-primary' : 'border-border'} shadow-sm`}
                      style={{ backgroundColor: color === 'black' ? '#000' : color === 'white' ? '#fff' : color }}
                      data-testid={`button-select-color-${color}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Selected: {selectedColor}</p>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </Button>
                  <span className="text-lg font-medium px-4" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  disabled={!selectedSize || !selectedColor || addToCartMutation.isPending}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  data-testid="button-toggle-wishlist"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? 'text-destructive fill-destructive' : ''}`} />
                </Button>
              </div>

              {/* Product Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Premium quality guarantee</span>
                </div>
              </div>

              {/* Stock Info */}
              {product.stock < 20 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium">
                    Only {product.stock} left in stock - order soon!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          <Card className="mb-16">
            <Tabs defaultValue="description">
              <div className="border-b border-border">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                  <TabsTrigger value="description" className="rounded-none px-6 py-4" data-testid="tab-description">
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="specifications" className="rounded-none px-6 py-4" data-testid="tab-specifications">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-none px-6 py-4" data-testid="tab-reviews">
                    Reviews (156)
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="description">
                <CardContent className="p-6">
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Product Description</h3>
                    <p className="text-muted-foreground mb-4">
                      {product.description || "This premium T-shirt combines comfort with style, featuring high-quality materials and expert craftsmanship."}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Our T-shirts are made from 100% premium cotton, ensuring durability and comfort for everyday wear. The fabric is pre-shrunk and colorfast, maintaining its shape and color wash after wash.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>100% premium cotton construction</li>
                      <li>Pre-shrunk for consistent fit</li>
                      <li>Reinforced shoulder seams</li>
                      <li>Tagless neck label for comfort</li>
                      <li>Machine washable</li>
                    </ul>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="specifications">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Material</h4>
                      <p className="text-muted-foreground">100% Cotton</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Weight</h4>
                      <p className="text-muted-foreground">180 GSM</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Fit</h4>
                      <p className="text-muted-foreground">Regular Fit</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Care Instructions</h4>
                      <p className="text-muted-foreground">Machine wash cold, tumble dry low</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Available Sizes</h4>
                      <p className="text-muted-foreground">{product.sizes.join(", ")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Available Colors</h4>
                      <p className="text-muted-foreground">{product.colors.join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="reviews">
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {/* Review Display */}
                    <ReviewDisplay productId={product.id} />
                    
                    {/* Review Form - Only show for authenticated users */}
                    {user && (
                      <div className="pt-8 border-t">
                        <ReviewForm productId={product.id} />
                      </div>
                    )}
                    
                    {/* Login prompt for non-authenticated users */}
                    {!user && (
                      <div className="pt-8 border-t">
                        <Card>
                          <CardContent className="py-8 text-center">
                            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Share Your Experience</h3>
                            <p className="text-muted-foreground mb-4">Sign in to write a review for this product.</p>
                            <Button onClick={() => navigate("/auth")}>
                              Sign In to Review
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
