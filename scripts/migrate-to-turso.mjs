import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

config();

const sqlite = new Database("./dev.db");
const turso = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log("🔄 Migrating data from SQLite to Turso...\n");

  // Migrate Users
  const users = sqlite.prepare("SELECT * FROM User").all();
  console.log(`Found ${users.length} users`);
  for (const user of users) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO User (id, name, email, password, role, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [user.id, user.name, user.email, user.password, user.role, user.createdAt, user.updatedAt],
      });
    } catch (e) {
      console.log(`  User ${user.email} already exists or error:`, e.message);
    }
  }

  // Migrate Categories
  const categories = sqlite.prepare("SELECT * FROM Category").all();
  console.log(`Found ${categories.length} categories`);
  for (const cat of categories) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO Category (id, name, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?)`,
        args: [cat.id, cat.name, cat.createdAt, cat.updatedAt],
      });
    } catch (e) {
      console.log(`  Category ${cat.name} error:`, e.message);
    }
  }

  // Migrate Links
  const links = sqlite.prepare("SELECT * FROM Link").all();
  console.log(`Found ${links.length} links`);
  for (const link of links) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO Link (id, url, categoryId, clicks, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [link.id, link.url, link.categoryId, link.clicks, link.createdAt, link.updatedAt],
      });
    } catch (e) {
      console.log(`  Link ${link.url} error:`, e.message);
    }
  }

  // Migrate Posts
  const posts = sqlite.prepare("SELECT * FROM Post").all();
  console.log(`Found ${posts.length} posts`);
  for (const post of posts) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO Post (id, title, slug, content, excerpt, featured, published, viewCount, authorId, createdAt, updatedAt, publishedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [post.id, post.title, post.slug, post.content, post.excerpt, post.featured ? 1 : 0, post.published ? 1 : 0, post.viewCount, post.authorId, post.createdAt, post.updatedAt, post.publishedAt],
      });
    } catch (e) {
      console.log(`  Post ${post.title} error:`, e.message);
    }
  }

  // Migrate Tags
  const tags = sqlite.prepare("SELECT * FROM Tag").all();
  console.log(`Found ${tags.length} tags`);
  for (const tag of tags) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO Tag (id, name, slug, createdAt) 
              VALUES (?, ?, ?, ?)`,
        args: [tag.id, tag.name, tag.slug, tag.createdAt],
      });
    } catch (e) {
      console.log(`  Tag ${tag.name} error:`, e.message);
    }
  }

  // Migrate Settings
  const settings = sqlite.prepare("SELECT * FROM Settings").all();
  console.log(`Found ${settings.length} settings`);
  for (const setting of settings) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO Settings (id, key, value, updatedAt) 
              VALUES (?, ?, ?, ?)`,
        args: [setting.id, setting.key, setting.value, setting.updatedAt],
      });
    } catch (e) {
      console.log(`  Setting ${setting.key} error:`, e.message);
    }
  }

  // Verify
  const catCount = await turso.execute("SELECT COUNT(*) as count FROM Category");
  const linkCount = await turso.execute("SELECT COUNT(*) as count FROM Link");
  const postCount = await turso.execute("SELECT COUNT(*) as count FROM Post");

  console.log("\n✅ Migration complete!");
  console.log(`Categories: ${catCount.rows[0].count}`);
  console.log(`Links: ${linkCount.rows[0].count}`);
  console.log(`Posts: ${postCount.rows[0].count}`);
}

migrate().catch(console.error);
