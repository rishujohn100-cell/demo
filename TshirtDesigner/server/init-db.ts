import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initializeDatabase() {
  console.log("Initializing database tables...");
  
  try {
    // Create tables using raw SQL to avoid connection issues
    await db.execute(sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        colors TEXT[] NOT NULL,
        sizes TEXT[] NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        stock INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS designs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        name TEXT NOT NULL,
        design_data JSONB NOT NULL,
        thumbnail TEXT,
        is_public BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        product_id VARCHAR REFERENCES products(id),
        design_id VARCHAR REFERENCES designs(id),
        quantity INTEGER NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        custom_price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        shipping_address JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR REFERENCES orders(id) NOT NULL,
        product_id VARCHAR REFERENCES products(id),
        design_id VARCHAR REFERENCES designs(id),
        quantity INTEGER NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wishlist_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        product_id VARCHAR REFERENCES products(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      ) WITH (OIDS=FALSE);

      ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
    `);
    
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.log("Database tables may already exist or initialization failed:", error);
  }
}