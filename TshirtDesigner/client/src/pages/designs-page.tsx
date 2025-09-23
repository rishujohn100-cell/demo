import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Plus, Edit3, ShoppingCart, Palette, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Design {
  id: string;
  name: string;
  designData: {
    product: {
      id: string;
      name: string;
      basePrice: string;
    };
    color: string;
    size: string;
    elements: any[];
  };
  thumbnail: string;
  createdAt: string;
}

export default function DesignsPage() {
  const { user } = useAuth();
  const { addToCartMutation } = useCart();
  const queryClient = useQueryClient();

  const { data: designs = [], isLoading, error } = useQuery<Design[]>({
    queryKey: ["user-designs"],
    queryFn: async () => {
      const response = await fetch("/api/designs");
      if (!response.ok) {
        throw new Error("Failed to fetch designs");
      }
      return response.json();
    },
    enabled: !!user,
  });

  const deleteDesignMutation = useMutation({
    mutationFn: async (designId: string) => {
      const response = await fetch(`/api/designs/${designId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete design");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-designs"] });
      toast.success("Design deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete design");
    },
  });

  const addDesignToCart = async (design: Design) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const customPrice = (parseFloat(design.designData.product.basePrice) + 5).toFixed(2);
      
      const cartItemData = {
        userId: user.id,
        productId: design.designData.product.id,
        designId: design.id,
        quantity: 1,
        size: design.designData.size,
        color: design.designData.color,
        customPrice
      };
      
      await addToCartMutation.mutateAsync(cartItemData);
      toast.success("Design added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">My Designs</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View and manage all your custom T-shirt designs. You can add them to your cart or edit them in the Design Studio.
            </p>
          </div>

          {/* Create New Design CTA */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-semibold mb-2">Create a New Design</h3>
                    <p className="text-muted-foreground">
                      Use our powerful Design Studio to create unique T-shirt designs with text, shapes, and custom elements.
                    </p>
                  </div>
                  <Link href="/design-studio">
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Design
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Designs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Failed to load your designs. Please try again later.</p>
              </div>
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                <p>Start creating your first custom T-shirt design!</p>
              </div>
              <Link href="/design-studio">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Design
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design) => (
                <Card key={design.id} className="group hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                    {design.thumbnail ? (
                      <img
                        src={design.thumbnail}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Palette className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{design.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {design.designData.product.name}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {design.designData.color}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Size {design.designData.size}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        ${(parseFloat(design.designData.product.basePrice) + 5).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <Link href={`/design-studio?edit=${design.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => addDesignToCart(design)}
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-2"
                            disabled={deleteDesignMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Design</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{design.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDesignMutation.mutate(design.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}