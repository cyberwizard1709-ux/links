/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.mjs email@example.com password "Full Name"
 */

import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { randomUUID } from "crypto";

config();

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env");
  process.exit(1);
}

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const name = args[2] || "Admin";

if (!email || !password) {
  console.log("Usage: node scripts/create-admin.mjs <email> <password> [name]");
  console.log("Example: node scripts/create-admin.mjs admin@example.com mypassword123 \"John Doe\"");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function createAdmin() {
  try {
    // Check if user already exists
    const existing = await client.execute({
      sql: "SELECT * FROM User WHERE email = ?",
      args: [email],
    });

    if (existing.rows.length > 0) {
      // Update existing user to admin
      await client.execute({
        sql: "UPDATE User SET password = ?, role = 'ADMIN', name = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?",
        args: [await bcrypt.hash(password, 10), name, email],
      });
      console.log(`✅ Updated existing user ${email} to admin`);
    } else {
      // Create new admin user
      const id = randomUUID();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await client.execute({
        sql: `INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [id, name, email, hashedPassword],
      });
      console.log(`✅ Created admin user: ${email}`);
    }

    console.log("\nYou can now login at: http://localhost:3000/admin/login");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
