import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Grid, List, Filter } from "lucide-react";
import { Product } from "@shared/schema";

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sizeFilter, setSizeFilter] = useState<string[]>([]);
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categories = ['Basic', 'Graphic', 'Premium', 'Sports'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'gray'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(product.category);
    const matchesPrice = parseFloat(product.basePrice) >= priceRange[0] && parseFloat(product.basePrice) <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.basePrice) - parseFloat(b.basePrice);
      case 'price-high':
        return parseFloat(b.basePrice) - parseFloat(a.basePrice);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategoryFilter([...categoryFilter, category]);
    } else {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    }
  };

  const clearFilters = () => {
    setCategoryFilter([]);
    setSizeFilter([]);
    setColorFilter([]);
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Product Catalog</h1>
            <p className="text-muted-foreground">Browse our complete collection of T-shirts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      data-testid="input-catalog-search"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <Label className="text-base font-medium">Category</Label>
                    <div className="space-y-2 mt-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={categoryFilter.includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                            data-testid={`checkbox-category-${category.toLowerCase()}`}
                          />
                          <Label htmlFor={category} className="text-sm">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size Filter */}
                  <div>
                    <Label className="text-base font-medium">Size</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {sizes.map((size) => (
                        <Button
                          key={size}
                          variant={sizeFilter.includes(size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (sizeFilter.includes(size)) {
                              setSizeFilter(sizeFilter.filter(s => s !== size));
                            } else {
                              setSizeFilter([...sizeFilter, size]);
                            }
                          }}
                          data-testid={`button-filter-size-${size.toLowerCase()}`}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <Label className="text-base font-medium">Color</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            if (colorFilter.includes(color)) {
                              setColorFilter(colorFilter.filter(c => c !== color));
                            } else {
                              setColorFilter([...colorFilter, color]);
                            }
                          }}
                          className={`w-8 h-8 rounded-full border-2 ${colorFilter.includes(color) ? 'border-primary' : 'border-border'}`}
                          style={{ backgroundColor: color === 'black' ? '#000' : color === 'white' ? '#fff' : color }}
                          data-testid={`button-filter-color-${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-base font-medium">Price Range</Label>
                    <div className="mt-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Sorting and View Options */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground" data-testid="text-product-count">
                  Showing {sortedProducts.length} of {products.length} products
                </p>
                <div className="flex items-center space-x-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48" data-testid="select-sort-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Sort by: Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      data-testid="button-view-grid"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      data-testid="button-view-list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : 
                  "space-y-4"
                }>
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
