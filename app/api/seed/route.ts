import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await db.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Create sample categories
    const categories = [
      { name: "Development" },
      { name: "Design" },
      { name: "Productivity" },
      { name: "Learning" },
    ];

    for (const category of categories) {
      await db.category.create({
        data: category,
      });
    }

    // Create sample links
    const devCategory = await db.category.findFirst({
      where: { name: "Development" },
    });

    if (devCategory) {
      await db.link.createMany({
        data: [
          { url: "https://github.com", categoryId: devCategory.id },
          { url: "https://stackoverflow.com", categoryId: devCategory.id },
        ],
      });
    }

    return NextResponse.json({
      message: "Seed data created successfully",
      admin: {
        email: admin.email,
        password: "admin123",
      },
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
