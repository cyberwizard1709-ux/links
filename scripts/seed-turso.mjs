import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

config();

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ DATABASE_URL and TURSO_AUTH_TOKEN must be set");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function seed() {
  try {
    // Create admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await client.execute({
      sql: "INSERT OR IGNORE INTO User (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "Admin", "admin@example.com", hashedPassword, "ADMIN"],
    });
    console.log("✅ Admin user created");

    // Create categories
    const cat1 = randomUUID();
    const cat2 = randomUUID();
    const cat3 = randomUUID();
    const cat4 = randomUUID();

    await client.execute({
      sql: "INSERT OR IGNORE INTO Category (id, name, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [cat1, "Development"],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Category (id, name, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [cat2, "Design"],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Category (id, name, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [cat3, "Productivity"],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Category (id, name, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [cat4, "Learning"],
    });
    console.log("✅ Categories created");

    // Create links
    await client.execute({
      sql: "INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "https://github.com", cat1],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "https://stackoverflow.com", cat1],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "https://figma.com", cat2],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "https://dribbble.com", cat2],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "https://notion.so", cat3],
    });
    await client.execute({
      sql: "INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      args: [randomUUID(), "https://coursera.org", cat4],
    });
    console.log("✅ Links created");

    console.log("\n🎉 Turso database seeded successfully!");
    console.log("\nLogin credentials:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
}

seed();
