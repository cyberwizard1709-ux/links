import GhostContentAPI from "@tryghost/content-api";
import GhostAdminAPI from "@tryghost/admin-api";

// Check if Ghost is configured
export function isGhostConfigured(): boolean {
  const ghostUrl = process.env.GHOST_URL;
  const contentApiKey = process.env.GHOST_CONTENT_API_KEY;

  return !!(
    ghostUrl &&
    contentApiKey &&
    contentApiKey !== "your-ghost-content-api-key"
  );
}

// Lazy initialization of Ghost APIs
function getGhostContentAPI() {
  const ghostUrl = process.env.GHOST_URL;
  const contentApiKey = process.env.GHOST_CONTENT_API_KEY;

  if (!ghostUrl || !contentApiKey || contentApiKey === "your-ghost-content-api-key") {
    return null;
  }

  return new GhostContentAPI({
    url: ghostUrl,
    key: contentApiKey,
    version: "v5.0",
  });
}

function getGhostAdminAPI() {
  const ghostUrl = process.env.GHOST_URL;
  const adminApiKey = process.env.GHOST_ADMIN_API_KEY;

  if (!ghostUrl || !adminApiKey || adminApiKey === "your-ghost-admin-api-key") {
    return null;
  }

  return new GhostAdminAPI({
    url: ghostUrl,
    key: adminApiKey,
    version: "v5.0",
  });
}

// Types for blog posts
export interface BlogPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  reading_time: number;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  primary_author: {
    id: string;
    name: string;
    profile_image: string | null;
  } | null;
}

// Fetch posts from Ghost
export async function getPosts(options?: {
  limit?: number;
  page?: number;
  tag?: string;
  featured?: boolean;
}): Promise<{ posts: BlogPost[]; meta: any }> {
  const api = getGhostContentAPI();
  
  if (!api) {
    console.warn("Ghost Content API not configured");
    return { posts: [], meta: {} };
  }

  try {
    const posts = await api.posts.browse({
      limit: options?.limit || 10,
      page: options?.page || 1,
      filter: options?.tag ? `tag:${options.tag}` : undefined,
      include: ["tags", "authors"],
    });

    return {
      posts: posts as unknown as BlogPost[],
      meta: (posts as any).meta,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], meta: {} };
  }
}

// Fetch single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const api = getGhostContentAPI();
  
  if (!api) {
    console.warn("Ghost Content API not configured");
    return null;
  }

  try {
    const post = await api.posts.read(
      { slug },
      { include: ["tags", "authors"] }
    );
    return post as unknown as BlogPost;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// Fetch tags
export async function getTags(): Promise<
  Array<{ id: string; name: string; slug: string; description: string }>
> {
  const api = getGhostContentAPI();
  
  if (!api) {
    console.warn("Ghost Content API not configured");
    return [];
  }

  try {
    const tags = await api.tags.browse({ limit: "all" });
    return tags as unknown as Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
    }>;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
