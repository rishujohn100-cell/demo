import {
  users, products, designs, cartItems, orders, orderItems, wishlistItems, reviews,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Design, type InsertDesign,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type WishlistItem, type InsertWishlistItem,
  type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin user management methods
  getAllUsers(): Promise<User[]>;
  getUsersWithOrderCounts(): Promise<(User & { orderCount: number; totalSpent: number })[]>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Design methods
  getUserDesigns(userId: string): Promise<Design[]>;
  getDesign(id: string): Promise<Design | undefined>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: string, updates: Partial<InsertDesign>): Promise<Design | undefined>;
  deleteDesign(id: string): Promise<boolean>;

  // Cart methods
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, updates: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Order methods
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderWithItems(id: string): Promise<(Order & { orderItems: OrderItem[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Wishlist methods
  getWishlistItems(userId: string): Promise<WishlistItem[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;

  // Review methods
  getProductReviews(productId: string): Promise<(Review & { user: User })[]>;
  getUserProductReview(userId: string, productId: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Admin user management methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersWithOrderCounts(): Promise<(Omit<User, 'password'> & { orderCount: number; totalSpent: number })[]> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        orderCount: sql<number>`COALESCE(COUNT(${orders.id}), 0)`.as('orderCount'),
        totalSpent: sql<number>`COALESCE(SUM(${orders.total}), 0)`.as('totalSpent'),
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .where(eq(users.role, 'customer'))
      .groupBy(users.id, users.username, users.email, users.firstName, users.lastName, users.role, users.createdAt)
      .orderBy(desc(users.createdAt));
    
    return result;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Design methods
  async getUserDesigns(userId: string): Promise<Design[]> {
    return await db.select().from(designs).where(eq(designs.userId, userId)).orderBy(desc(designs.createdAt));
  }

  async getDesign(id: string): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design || undefined;
  }

  async createDesign(insertDesign: InsertDesign): Promise<Design> {
    const [design] = await db
      .insert(designs)
      .values(insertDesign)
      .returning();
    return design;
  }

  async updateDesign(id: string, updates: Partial<InsertDesign>): Promise<Design | undefined> {
    const [design] = await db
      .update(designs)
      .set(updates)
      .where(eq(designs.id, id))
      .returning();
    return design || undefined;
  }

  async deleteDesign(id: string): Promise<boolean> {
    const result = await db.delete(designs).where(eq(designs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, insertCartItem.userId),
          eq(cartItems.productId, insertCartItem.productId || ''),
          eq(cartItems.size, insertCartItem.size),
          eq(cartItems.color, insertCartItem.color)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + insertCartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async updateCartItem(id: string, updates: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, id))
      .returning();
    return cartItem || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }

  // Order methods
  async getUserOrders(userId: string): Promise<(Order & { orderItems: OrderItem[] })[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, orderItems: items };
      })
    );
    
    return ordersWithItems;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderWithItems(id: string): Promise<(Order & { orderItems: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, orderItems: items };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();

    // Insert order items
    await db
      .insert(orderItems)
      .values(items.map(item => ({ ...item, orderId: order.id })));

    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  // Wishlist methods
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const [wishlistItem] = await db
      .insert(wishlistItems)
      .values(insertWishlistItem)
      .returning();
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private designs: Map<string, Design> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private wishlistItems: Map<string, WishlistItem> = new Map();
  private reviews: Map<string, Review> = new Map();
  
  sessionStore: any;
  
  constructor() {
    // Simple in-memory session store for development
    this.sessionStore = {
      sessions: new Map(),
      get: (sessionId: string, callback: Function) => {
        const session = this.sessionStore.sessions.get(sessionId);
        callback(null, session);
      },
      set: (sessionId: string, session: any, callback: Function) => {
        this.sessionStore.sessions.set(sessionId, session);
        callback();
      },
      destroy: (sessionId: string, callback: Function) => {
        this.sessionStore.sessions.delete(sessionId);
        callback();
      }
    };
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add some sample products
    const products = [
      {
        id: 'product-1',
        name: 'Custom T-Shirt',
        description: 'High-quality cotton t-shirt perfect for custom designs',
        basePrice: '19.99',
        category: 'apparel',
        colors: ['white', 'black', 'navy', 'red'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        imageUrl: null,
        isActive: true,
        stock: 100,
        createdAt: new Date()
      },
      {
        id: 'product-2',
        name: 'Canvas Bag',
        description: 'Eco-friendly canvas tote bag for everyday use',
        basePrice: '12.99',
        category: 'accessories',
        colors: ['natural', 'black', 'navy'],
        sizes: ['Standard'],
        imageUrl: null,
        isActive: true,
        stock: 50,
        createdAt: new Date()
      }
    ];
    
    products.forEach(product => this.products.set(product.id, product));
  }
  
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: 'user-' + Date.now(),
      username: userData.username,
      password: userData.password,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || 'customer',
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const product: Product = {
      id: 'product-' + Date.now(),
      name: productData.name,
      description: productData.description || null,
      basePrice: productData.basePrice,
      category: productData.category,
      colors: productData.colors,
      sizes: productData.sizes,
      imageUrl: productData.imageUrl || null,
      isActive: productData.isActive ?? true,
      stock: productData.stock ?? 0,
      createdAt: new Date()
    };
    this.products.set(product.id, product);
    return product;
  }
  
  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;
    
    const updated = { ...product, isActive: false };
    this.products.set(id, updated);
    return true;
  }
  
  // Design methods
  async getUserDesigns(userId: string): Promise<Design[]> {
    return Array.from(this.designs.values()).filter(d => d.userId === userId);
  }
  
  async getDesign(id: string): Promise<Design | undefined> {
    return this.designs.get(id);
  }
  
  async createDesign(designData: InsertDesign): Promise<Design> {
    const design: Design = {
      id: 'design-' + Date.now(),
      userId: designData.userId,
      name: designData.name,
      designData: designData.designData,
      thumbnail: designData.thumbnail || null,
      isPublic: designData.isPublic ?? false,
      createdAt: new Date()
    };
    this.designs.set(design.id, design);
    return design;
  }
  
  async updateDesign(id: string, updates: Partial<InsertDesign>): Promise<Design | undefined> {
    const design = this.designs.get(id);
    if (!design) return undefined;
    
    const updated = { ...design, ...updates };
    this.designs.set(id, updated);
    return updated;
  }
  
  async deleteDesign(id: string): Promise<boolean> {
    return this.designs.delete(id);
  }
  
  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }
  
  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = Array.from(this.cartItems.values()).filter(item =>
      item.userId === cartItemData.userId &&
      item.productId === cartItemData.productId &&
      item.size === cartItemData.size &&
      item.color === cartItemData.color
    );
    
    if (existingItems.length > 0) {
      const existing = existingItems[0];
      const updated = { ...existing, quantity: existing.quantity + cartItemData.quantity };
      this.cartItems.set(existing.id, updated);
      return updated;
    }
    
    const cartItem: CartItem = {
      id: 'cart-' + Date.now(),
      userId: cartItemData.userId,
      productId: cartItemData.productId || null,
      designId: cartItemData.designId || null,
      quantity: cartItemData.quantity,
      size: cartItemData.size,
      color: cartItemData.color,
      customPrice: cartItemData.customPrice || null,
      createdAt: new Date()
    };
    this.cartItems.set(cartItem.id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(id: string, updates: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updated = { ...cartItem, ...updates };
    this.cartItems.set(id, updated);
    return updated;
  }
  
  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: string): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.userId === userId
    );
    userItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }
  
  // Order methods
  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderWithItems(id: string): Promise<(Order & { orderItems: OrderItem[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values()).filter(item => item.orderId === id);
    return { ...order, orderItems: items };
  }
  
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const order: Order = {
      id: 'order-' + Date.now(),
      userId: orderData.userId,
      total: orderData.total,
      status: orderData.status || 'pending',
      shippingAddress: orderData.shippingAddress,
      createdAt: new Date()
    };
    this.orders.set(order.id, order);
    
    // Create order items
    items.forEach((itemData, index) => {
      const orderItem: OrderItem = {
        id: 'order-item-' + Date.now() + '-' + index,
        orderId: order.id,
        productId: itemData.productId || null,
        designId: itemData.designId || null,
        quantity: itemData.quantity,
        size: itemData.size,
        color: itemData.color,
        price: itemData.price
      };
      this.orderItems.set(orderItem.id, orderItem);
    });
    
    return order;
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
  
  // Wishlist methods
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
  }
  
  async addToWishlist(wishlistItemData: InsertWishlistItem): Promise<WishlistItem> {
    const wishlistItem: WishlistItem = {
      id: 'wishlist-' + Date.now(),
      ...wishlistItemData,
      createdAt: new Date()
    };
    this.wishlistItems.set(wishlistItem.id, wishlistItem);
    return wishlistItem;
  }
  
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const items = Array.from(this.wishlistItems.entries()).filter(
      ([_, item]) => item.userId === userId && item.productId === productId
    );
    items.forEach(([id]) => this.wishlistItems.delete(id));
    return items.length > 0;
  }

  // Review methods
  async getProductReviews(productId: string): Promise<(Review & { user: User })[]> {
    const reviews = Array.from(this.reviews.values()).filter(review => review.productId === productId);
    return reviews.map(review => {
      const user = this.users.get(review.userId);
      return {
        ...review,
        user: user || {
          id: review.userId,
          username: 'Unknown User',
          password: '',
          email: '',
          firstName: null,
          lastName: null,
          role: 'customer',
          createdAt: new Date()
        }
      };
    });
  }

  async getUserProductReview(userId: string, productId: string): Promise<Review | undefined> {
    const reviews = Array.from(this.reviews.values());
    return reviews.find(review => review.userId === userId && review.productId === productId);
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const review: Review = {
      id: 'review-' + Date.now(),
      ...reviewData,
      reviewText: reviewData.reviewText || null,
      isVerifiedPurchase: reviewData.isVerifiedPurchase || false,
      createdAt: new Date()
    };
    this.reviews.set(review.id, review);
    return review;
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    // Check if user has any completed orders containing this product
    const userOrders = Array.from(this.orders.values()).filter(
      order => order.userId === userId && (order.status === 'delivered' || order.status === 'shipped')
    );
    
    for (const order of userOrders) {
      const orderItemsForOrder = Array.from(this.orderItems.values()).filter(
        item => item.orderId === order.id && item.productId === productId
      );
      if (orderItemsForOrder.length > 0) {
        return true;
      }
    }
    
    return false;
  }
}

// Use in-memory storage for now to avoid database connection issues
export const storage = new MemStorage();
