import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type InsertProduct, type Order, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  // Customer management state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Data queries
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["/api/admin/customers"],
    queryFn: () => apiRequest("/api/admin/customers"),
  });

  const { data: customerOrders = [], isLoading: customerOrdersLoading } = useQuery({
    queryKey: ["/api/admin/customers", selectedCustomerId, "orders"],
    queryFn: () => apiRequest(`/api/admin/customers/${selectedCustomerId}/orders`),
    enabled: !!selectedCustomerId,
  });

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">Admin privileges required to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: "25.99",
      category: "Basic",
      colors: ["black", "white"],
      sizes: ["S", "M", "L", "XL"],
      imageUrl: "",
      stock: 100,
      isActive: true,
    },
  });

  const onCreateProduct = async (data: InsertProduct) => {
    try {
      await apiRequest("POST", "/api/products", data);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddProductOpen(false);
      productForm.reset();
      toast({
        title: "Product created",
        description: "Product has been successfully created",
      });
    } catch (error) {
      toast({
        title: "Failed to create product",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/products/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Calculate dashboard stats
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const totalOrders = orders.length;
  const totalCustomers = 456; // This would come from a users count query in real implementation
  const totalProducts = products.filter(p => p.isActive).length;

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your T-shirt business efficiently</p>
              </div>
              <div className="flex items-center space-x-4">
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-product">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(onCreateProduct)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-product-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-product-category">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Basic">Basic</SelectItem>
                                    <SelectItem value="Graphic">Graphic</SelectItem>
                                    <SelectItem value="Premium">Premium</SelectItem>
                                    <SelectItem value="Sports">Sports</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} data-testid="textarea-product-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={productForm.control}
                            name="basePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base Price</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    value={field.value || 0}
                                    data-testid="input-product-stock"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-product-image-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={productForm.formState.isSubmitting} data-testid="button-submit-product">
                            {productForm.formState.isSubmitting ? "Creating..." : "Create Product"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button variant="secondary" data-testid="button-export-data">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-sales">
                      ${totalSales.toFixed(2)}
                    </p>
                    <p className="text-sm text-accent">+12.5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="text-primary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-orders">
                      {totalOrders}
                    </p>
                    <p className="text-sm text-accent">+8.2% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="text-accent h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-customers">
                      {totalCustomers}
                    </p>
                    <p className="text-sm text-accent">+15.3% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Products</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-products">
                      {totalProducts}
                    </p>
                    <p className="text-sm text-muted-foreground">Active products</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Navigation Tabs */}
          <Card>
            <div className="border-b border-border">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                  <TabsTrigger value="products" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4" data-testid="tab-products">
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4" data-testid="tab-orders">
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="customers" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4" data-testid="tab-customers">
                    Customers
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4" data-testid="tab-analytics">
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-card-foreground">Product Management</h3>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                            data-testid="input-search-products"
                          />
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-48" data-testid="select-filter-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Basic">Basic Tees</SelectItem>
                            <SelectItem value="Graphic">Graphic Tees</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Products Table */}
                    {productsLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Product</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Category</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Price</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Stock</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product) => (
                              <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`row-product-${product.id}`}>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={product.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                                      alt={product.name}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div>
                                      <p className="font-medium text-card-foreground" data-testid={`text-product-name-${product.id}`}>
                                        {product.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        SKU: {product.id.slice(0, 8).toUpperCase()}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-card-foreground" data-testid={`text-product-category-${product.id}`}>
                                  {product.category}
                                </td>
                                <td className="py-4 px-4 text-card-foreground" data-testid={`text-product-price-${product.id}`}>
                                  ${product.basePrice}
                                </td>
                                <td className="py-4 px-4 text-card-foreground" data-testid={`text-product-stock-${product.id}`}>
                                  {product.stock}
                                </td>
                                <td className="py-4 px-4">
                                  <Badge variant={product.isActive ? "default" : "secondary"} data-testid={`badge-product-status-${product.id}`}>
                                    {product.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Button size="icon" variant="ghost" data-testid={`button-edit-${product.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() => deleteProduct(product.id)}
                                      data-testid={`button-delete-${product.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                <TabsContent value="orders">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-card-foreground mb-6">Order Management</h3>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                        <p className="text-muted-foreground">Orders will appear here once customers start purchasing.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Order ID</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Customer</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Total</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Date</th>
                              <th className="text-left py-3 px-4 font-medium text-card-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`row-order-${order.id}`}>
                                <td className="py-4 px-4 font-mono text-sm" data-testid={`text-order-id-${order.id}`}>
                                  {order.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="py-4 px-4 text-card-foreground" data-testid={`text-order-customer-${order.id}`}>
                                  {order.userId}
                                </td>
                                <td className="py-4 px-4 text-card-foreground" data-testid={`text-order-total-${order.id}`}>
                                  ${order.total}
                                </td>
                                <td className="py-4 px-4">
                                  <Badge 
                                    variant={
                                      order.status === "delivered" ? "default" :
                                      order.status === "shipped" ? "secondary" :
                                      order.status === "processing" ? "outline" : "destructive"
                                    }
                                    data-testid={`badge-order-status-${order.id}`}
                                  >
                                    {order.status}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4 text-card-foreground" data-testid={`text-order-date-${order.id}`}>
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4">
                                  <Button size="sm" variant="outline" data-testid={`button-view-order-${order.id}`}>
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                <TabsContent value="customers">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-card-foreground">Customer Management</h3>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Input
                            placeholder="Search customers..."
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                            data-testid="input-search-customers"
                          />
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {customersLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No customers yet</h3>
                        <p className="text-muted-foreground">Customers will appear here once they start registering.</p>
                      </div>
                    ) : (
                      <div className="grid lg:grid-cols-2 gap-6">
                        {/* Customer List */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">Customer List</h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {customers
                              .filter((customer: User & { orderCount: number; totalSpent: number }) =>
                                customer.username.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                                customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                                (customer.firstName && customer.firstName.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
                                (customer.lastName && customer.lastName.toLowerCase().includes(customerSearchQuery.toLowerCase()))
                              )
                              .map((customer: User & { orderCount: number; totalSpent: number }) => (
                                <Card 
                                  key={customer.id} 
                                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                    selectedCustomerId === customer.id ? 'border-primary bg-primary/5' : ''
                                  }`}
                                  onClick={() => setSelectedCustomerId(customer.id)}
                                  data-testid={`card-customer-${customer.id}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-semibold text-foreground">
                                            {customer.firstName && customer.lastName 
                                              ? `${customer.firstName} ${customer.lastName}` 
                                              : customer.username}
                                          </h5>
                                          <Badge variant="outline" className="text-xs">
                                            {customer.role}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Joined {new Date(customer.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-foreground">
                                          {customer.orderCount} orders
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          ${customer.totalSpent.toFixed(2)} total
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>

                        {/* Customer Orders */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">Customer Orders</h4>
                          {selectedCustomerId ? (
                            customerOrdersLoading ? (
                              <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                  <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                                ))}
                              </div>
                            ) : customerOrders.length === 0 ? (
                              <div className="text-center py-8">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No orders from this customer</p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {customerOrders.map((order: Order) => (
                                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-mono text-sm">
                                          #{order.id.slice(0, 8).toUpperCase()}
                                        </div>
                                        <Badge 
                                          variant={
                                            order.status === "delivered" ? "default" :
                                            order.status === "shipped" ? "secondary" :
                                            order.status === "processing" ? "outline" : "destructive"
                                          }
                                        >
                                          {order.status}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium">${order.total}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <Button size="sm" variant="outline">
                                          View Details
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="text-center py-8">
                              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">Select a customer to view their orders</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                <TabsContent value="analytics">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-card-foreground mb-6">Analytics & Reports</h3>
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Analytics dashboard coming soon</h3>
                      <p className="text-muted-foreground">Detailed analytics and reporting features will be available in the next update.</p>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
