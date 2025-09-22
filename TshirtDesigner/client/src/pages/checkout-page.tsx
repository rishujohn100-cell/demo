import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CreditCard, Truck, Lock, ShoppingCart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, InsertOrder, InsertOrderItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const checkoutSchema = z.object({
  // Shipping Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  
  // Payment
  paymentMethod: z.enum(["credit", "paypal", "bank"]),
  
  // Credit Card (conditional)
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardName: z.string().optional(),
  
  // Billing
  sameAsShipping: z.boolean().default(true),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingCountry: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate credit card fields when payment method is credit
  if (data.paymentMethod === "credit") {
    if (!data.cardName || data.cardName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name on card is required",
        path: ["cardName"],
      });
    }
    
    if (!data.cardNumber || data.cardNumber.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Card number is required",
        path: ["cardNumber"],
      });
    } else {
      // Basic card number validation (remove spaces and check length)
      const cleanCardNumber = data.cardNumber.replace(/\s/g, "");
      if (!/^\d{13,19}$/.test(cleanCardNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Card number must be 13-19 digits",
          path: ["cardNumber"],
        });
      } else {
        // Luhn checksum validation
        const luhnCheck = (cardNumber: string): boolean => {
          let sum = 0;
          let isEven = false;
          
          // Process digits from right to left
          for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
              digit *= 2;
              if (digit > 9) {
                digit -= 9;
              }
            }
            
            sum += digit;
            isEven = !isEven;
          }
          
          return sum % 10 === 0;
        };
        
        if (!luhnCheck(cleanCardNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid card number",
            path: ["cardNumber"],
          });
        }
      }
    }
    
    if (!data.expiryDate || data.expiryDate.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiry date is required",
        path: ["expiryDate"],
      });
    } else {
      // Validate expiry date format (MM/YY)
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry date must be in MM/YY format",
          path: ["expiryDate"],
        });
      } else {
        // Check if card is not expired (should be valid through the end of the expiry month)
        const [month, year] = data.expiryDate.split("/");
        const expiryMonth = parseInt(month) - 1; // JS months are 0-indexed
        const expiryYear = 2000 + parseInt(year);
        
        // Create date for first day of the month AFTER the expiry month
        const nextMonth = expiryMonth === 11 ? 0 : expiryMonth + 1;
        const nextYear = expiryMonth === 11 ? expiryYear + 1 : expiryYear;
        const expiryEndDate = new Date(nextYear, nextMonth, 1);
        
        const now = new Date();
        if (now >= expiryEndDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Card has expired",
            path: ["expiryDate"],
          });
        }
      }
    }
    
    if (!data.cvv || data.cvv.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CVV is required",
        path: ["cvv"],
      });
    } else if (!/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CVV must be 3-4 digits",
        path: ["cvv"],
      });
    }
  }
  
  // Validate billing address when different from shipping
  if (!data.sameAsShipping) {
    if (!data.billingFirstName || data.billingFirstName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing first name is required",
        path: ["billingFirstName"],
      });
    }
    
    if (!data.billingLastName || data.billingLastName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing last name is required",
        path: ["billingLastName"],
      });
    }
    
    if (!data.billingAddress || data.billingAddress.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing address is required",
        path: ["billingAddress"],
      });
    }
    
    if (!data.billingCity || data.billingCity.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing city is required",
        path: ["billingCity"],
      });
    }
    
    if (!data.billingState || data.billingState.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing state is required",
        path: ["billingState"],
      });
    }
    
    if (!data.billingZipCode || data.billingZipCode.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing ZIP code is required",
        path: ["billingZipCode"],
      });
    }
    
    if (!data.billingCountry || data.billingCountry.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing country is required",
        path: ["billingCountry"],
      });
    }
  }
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      paymentMethod: "credit",
      sameAsShipping: true,
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
      billingFirstName: "",
      billingLastName: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingZipCode: "",
      billingCountry: "United States",
    },
  });

  const watchPaymentMethod = watch("paymentMethod");
  const watchSameAsShipping = watch("sameAsShipping");

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { order: InsertOrder; items: InsertOrderItem[] }) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id.substring(0, 8)} has been placed.`,
      });
      setLocation(`/order-confirmation/${order.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getProduct = (productId: string | null) => {
    if (!productId) return null;
    return products.find(p => p.id === productId);
  };

  // Calculate totals
  const subtotal = cartTotal;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const finalTotal = subtotal + tax + shipping;

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare shipping address
      const shippingAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      };

      // Prepare order data
      const orderData = {
        order: {
          userId: user!.id,
          total: finalTotal.toString(),
          status: "pending",
          shippingAddress,
        },
        items: cartItems.map((item) => {
          const product = getProduct(item.productId);
          const price = item.customPrice ? parseFloat(item.customPrice) : parseFloat(product?.basePrice || "25.99");
          
          return {
            orderId: "", // Will be set by backend
            productId: item.productId,
            designId: item.designId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: price.toString(),
          };
        }),
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error("Order submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
              <p className="text-muted-foreground mb-4">
                You need to be signed in to checkout.
              </p>
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Add some items to your cart before checking out.
              </p>
              <Link href="/catalog">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/cart">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-muted-foreground mt-1">
            Complete your order ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Shipping Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        placeholder="NY"
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        {...register("zipCode")}
                        placeholder="10001"
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder="United States"
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={watchPaymentMethod}
                      onValueChange={(value) => setValue("paymentMethod", value as "credit" | "paypal" | "bank")}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit" id="credit" />
                        <Label htmlFor="credit">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal">PayPal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank">Bank Transfer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {watchPaymentMethod === "credit" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          {...register("cardName")}
                          placeholder="John Doe"
                        />
                        {errors.cardName && (
                          <p className="text-sm text-destructive mt-1">{errors.cardName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          {...register("cardNumber")}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && (
                          <p className="text-sm text-destructive mt-1">{errors.cardNumber.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            {...register("expiryDate")}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && (
                            <p className="text-sm text-destructive mt-1">{errors.expiryDate.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            {...register("cvv")}
                            placeholder="123"
                          />
                          {errors.cvv && (
                            <p className="text-sm text-destructive mt-1">{errors.cvv.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {watchPaymentMethod === "paypal" && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <p className="text-sm text-blue-800">
                        You will be redirected to PayPal to complete your payment.
                      </p>
                    </div>
                  )}

                  {watchPaymentMethod === "bank" && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-700">
                        Bank transfer details will be provided after order confirmation.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsShipping"
                      checked={watchSameAsShipping}
                      onCheckedChange={(checked) => setValue("sameAsShipping", !!checked)}
                    />
                    <Label htmlFor="sameAsShipping" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Same as shipping address
                    </Label>
                  </div>

                  {!watchSameAsShipping && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">First Name</Label>
                          <Input
                            id="billingFirstName"
                            {...register("billingFirstName")}
                            placeholder="John"
                          />
                          {errors.billingFirstName && (
                            <p className="text-sm text-destructive mt-1">{errors.billingFirstName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Last Name</Label>
                          <Input
                            id="billingLastName"
                            {...register("billingLastName")}
                            placeholder="Doe"
                          />
                          {errors.billingLastName && (
                            <p className="text-sm text-destructive mt-1">{errors.billingLastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingAddress">Address</Label>
                        <Input
                          id="billingAddress"
                          {...register("billingAddress")}
                          placeholder="123 Main Street"
                        />
                        {errors.billingAddress && (
                          <p className="text-sm text-destructive mt-1">{errors.billingAddress.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">City</Label>
                          <Input
                            id="billingCity"
                            {...register("billingCity")}
                            placeholder="New York"
                          />
                          {errors.billingCity && (
                            <p className="text-sm text-destructive mt-1">{errors.billingCity.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="billingState">State</Label>
                          <Input
                            id="billingState"
                            {...register("billingState")}
                            placeholder="NY"
                          />
                          {errors.billingState && (
                            <p className="text-sm text-destructive mt-1">{errors.billingState.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="billingZipCode">ZIP Code</Label>
                          <Input
                            id="billingZipCode"
                            {...register("billingZipCode")}
                            placeholder="10001"
                          />
                          {errors.billingZipCode && (
                            <p className="text-sm text-destructive mt-1">{errors.billingZipCode.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingCountry">Country</Label>
                        <Input
                          id="billingCountry"
                          {...register("billingCountry")}
                          placeholder="United States"
                        />
                        {errors.billingCountry && (
                          <p className="text-sm text-destructive mt-1">{errors.billingCountry.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const product = getProduct(item.productId);
                      const price = item.customPrice ? parseFloat(item.customPrice) : parseFloat(product?.basePrice || "25.99");

                      return (
                        <div key={item.id} className="flex items-center space-x-3">
                          <img
                            src={product?.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                            alt={product?.name || "Custom Design"}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {product?.name || "Custom Design"}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">{item.size}</Badge>
                              <Badge variant="outline" className="text-xs">{item.color}</Badge>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            ${(price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || cartItems.length === 0}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    Your payment information is secure and encrypted
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}