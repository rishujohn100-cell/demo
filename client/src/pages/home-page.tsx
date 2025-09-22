import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Truck, Award, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";

export default function HomePage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Design Your Dream <span className="text-primary">T-Shirt</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create custom designs with our powerful design studio or choose from our premium collection of T-shirts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/design-studio">
                <Button size="lg" className="px-8 py-4" data-testid="button-start-designing">
                  Start designing
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="outline" size="lg" className="px-8 py-4" data-testid="button-browse-catalog">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
            alt="Modern workspace with design tools and colorful T-shirts"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose TeeDesign Studio?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of creativity and quality with our advanced design tools and premium materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="text-primary text-2xl h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Advanced Design Studio</h3>
                <p className="text-muted-foreground">
                  Create stunning designs with our intuitive canvas editor featuring text, shapes, images, and advanced customization tools.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="text-accent text-2xl h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Fast & Reliable Shipping</h3>
                <p className="text-muted-foreground">
                  Get your custom T-shirts delivered quickly with our reliable shipping partners and real-time tracking updates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="text-purple-600 text-2xl h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Premium Quality</h3>
                <p className="text-muted-foreground">
                  High-quality fabrics and professional printing ensure your designs look amazing and last for years.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Discover our most popular T-shirt designs</p>
            </div>
            <Link href="/catalog" className="text-primary hover:text-primary/80 font-medium transition-colors" data-testid="link-view-all">
              View All →
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Products Available</h3>
              <p className="text-muted-foreground mb-6">
                Products will appear here once they are added by the admin.
              </p>
              <Link href="/design-studio">
                <Button data-testid="button-create-custom">
                  Create Custom Design
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
