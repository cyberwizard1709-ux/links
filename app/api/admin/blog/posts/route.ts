import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to generate excerpt
function generateExcerpt(content: string, maxLength: number = 160): string {
  const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

// GET all posts (admin - includes unpublished)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await db.post.findMany({
      include: {
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// CREATE new post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, tags, featured, published } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(title);
    
    // Check if slug exists and append number if needed
    let existingPost = await db.post.findUnique({ where: { slug } });
    let counter = 1;
    let originalSlug = slug;
    while (existingPost) {
      slug = `${originalSlug}-${counter}`;
      existingPost = await db.post.findUnique({ where: { slug } });
      counter++;
    }

    // Handle tags
    const tagConnections = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName);
        const tag = await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug,
          },
        });
        tagConnections.push({ id: tag.id });
      }
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: generateExcerpt(content),
        featured: featured || false,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
