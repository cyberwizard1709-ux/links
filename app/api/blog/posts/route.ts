import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured: boolean;
  published: boolean;
  viewCount: number;
  createdAt: Date;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: Array<{ id: string; name: string; slug: string }>;
  author: { id: string; name: string | null; image: string | null };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured") === "true";

    const skip = (page - 1) * limit;

    const where: {
      published: boolean;
      featured?: boolean;
      tags?: { some: { slug: string } };
    } = {
      published: true,
    };

    if (featured) {
      where.featured = true;
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          tags: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    // Calculate reading time (rough estimate: 200 words per minute)
    const postsWithMeta = (posts as Post[]).map((post: Post) => {
      const wordCount = post.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        ...post,
        reading_time: readingTime,
      };
    });

    return NextResponse.json({
      posts: postsWithMeta,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
