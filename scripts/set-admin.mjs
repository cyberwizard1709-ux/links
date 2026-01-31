/**
 * Set admin login credentials in Turso database
 * Usage: node scripts/set-admin.mjs <email> <password> [name]
 * 
 * Examples:
 *   node scripts/set-admin.mjs admin@example.com mypassword123
 *   node scripts/set-admin.mjs john@company.com securepass "John Doe"
 */

import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

config();

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Error: DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env file");
  process.exit(1);
}

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const name = args[2] || "Admin";

if (!email || !password) {
  console.log("Usage: node scripts/set-admin.mjs <email> <password> [name]");
  console.log("");
  console.log("Examples:");
  console.log('  node scripts/set-admin.mjs admin@example.com mypassword123');
  console.log('  node scripts/set-admin.mjs john@company.com securepass "John Doe"');
  console.log("");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function setAdmin() {
  try {
    // Check if user already exists
    const existing = await client.execute({
      sql: "SELECT * FROM User WHERE email = ?",
      args: [email],
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing.rows.length > 0) {
      // Update existing user
      await client.execute({
        sql: "UPDATE User SET password = ?, role = 'ADMIN', name = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?",
        args: [hashedPassword, name, email],
      });
      console.log("✅ Updated existing user to admin");
    } else {
      // Create new admin user
      const id = randomUUID();
      await client.execute({
        sql: `INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [id, name, email, hashedPassword],
      });
      console.log("✅ Created new admin user");
    }

    console.log("");
    console.log("🎉 Admin credentials set successfully!");
    console.log("");
    console.log("Login details:");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Name:     ${name}`);
    console.log("");
    console.log("Login at: http://localhost:3000/admin/login");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setAdmin();
