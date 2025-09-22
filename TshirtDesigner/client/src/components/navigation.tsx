import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSidebar } from "@/components/cart-sidebar";
import { Search, Heart, ShoppingCart, Menu, User, Settings, LogOut } from "lucide-react";

export function Navigation() {
  const { user, logoutMutation } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">TeeDesign Studio</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home-nav">
              Home
            </Link>
            <Link href="/catalog" className="text-foreground hover:text-primary transition-colors" data-testid="link-catalog">
              Catalog
            </Link>
            <Link href="/design-studio" className="text-foreground hover:text-primary transition-colors" data-testid="link-design-studio">
              Design Studio
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-about">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors" data-testid="link-contact">
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                  data-testid="input-search"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative" data-testid="button-wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="text-wishlist-count">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <CartSidebar>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-cart-toggle">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="text-cart-count">
                    {cartCount}
                  </span>
                )}
              </Button>
            </CartSidebar>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.firstName ? user.firstName[0] : user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center w-full" data-testid="link-profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/orders" className="flex items-center w-full" data-testid="link-orders">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/designs" className="flex items-center w-full" data-testid="link-designs">
                      <Settings className="h-4 w-4 mr-2" />
                      My Designs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem>
                      <Link href="/admin" className="flex items-center w-full" data-testid="link-admin">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button data-testid="button-login">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home-mobile">
                    Home
                  </Link>
                  <Link href="/catalog" className="text-foreground hover:text-primary transition-colors" data-testid="link-catalog-mobile">
                    Catalog
                  </Link>
                  <Link href="/design-studio" className="text-foreground hover:text-primary transition-colors" data-testid="link-design-studio-mobile">
                    Design Studio
                  </Link>
                  <Link href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-about">
              About
            </Link>
                  <Link href="/contact" className="text-foreground hover:text-primary transition-colors" data-testid="link-contact">
              Contact
            </Link>
                  <div className="pt-4">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-mobile"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
