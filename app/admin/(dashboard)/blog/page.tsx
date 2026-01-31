"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Star,
  FileText,
  ExternalLink,
  ArrowLeft,
  Check,
  Calendar,
  User,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured: boolean;
  published: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  tags: { id: string; name: string; slug: string }[];
  author: { id: string; name: string | null; email: string };
}

type ViewMode = "list" | "create" | "edit";

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    featured: false,
    published: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      } else {
        toast.error("Failed to fetch posts");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      tags: "",
      featured: false,
      published: false,
    });
    setEditingPost(null);
  };

  const handleBackToList = () => {
    setViewMode("list");
    resetForm();
  };

  const handleCreateNew = () => {
    resetForm();
    setViewMode("create");
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      tags: post.tags.map((t) => t.name).join(", "),
      featured: post.featured,
      published: post.published,
    });
    setViewMode("edit");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
        }),
      });

      if (res.ok) {
        toast.success("Post created successfully");
        handleBackToList();
        fetchPosts();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      const res = await fetch(`/api/admin/blog/posts/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
        }),
      });

      if (res.ok) {
        toast.success("Post updated successfully");
        handleBackToList();
        fetchPosts();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Post deleted successfully");
        fetchPosts();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });

      if (res.ok) {
        toast.success(post.published ? "Post unpublished" : "Post published");
        fetchPosts();
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Draft";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  // Create/Edit Form View
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              {viewMode === "create" ? "New Post" : "Edit Post"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "edit" && editingPost && (
              <a
                href={`/blog/${editingPost.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mr-4"
              >
                <ExternalLink className="w-4 h-4" />
                Preview
              </a>
            )}
            <Button
              type="submit"
              form="post-form"
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Check className="w-4 h-4 mr-2" />
              {viewMode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>

        <form
          id="post-form"
          onSubmit={viewMode === "create" ? handleCreatePost : handleUpdatePost}
          className="max-w-3xl space-y-6"
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter post title"
                  className="text-lg"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Content (HTML supported)
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your post content..."
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tags (comma-separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="technology, programming, tutorial"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      formData.published ? "bg-green-500" : "bg-slate-200"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, published: !formData.published })
                    }
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform m-1 ${
                        formData.published ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                  <span className="text-sm text-slate-700">
                    {formData.published ? "Published" : "Draft"}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      formData.featured ? "bg-amber-500" : "bg-slate-200"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, featured: !formData.featured })
                    }
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform m-1 ${
                        formData.featured ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Featured
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  // List View
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-slate-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="border-slate-200/60 hover:border-slate-300 transition-colors"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.published ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 hover:bg-green-50 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                    {post.featured && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-50 text-amber-700 hover:bg-amber-50 text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-medium text-slate-900 mb-1">{post.title}</h3>

                  <p className="text-sm text-slate-500 line-clamp-1 mb-3">
                    {post.excerpt || "No excerpt"}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {post.author.name || post.author.email}
                    </span>
                    <span>{post.viewCount} views</span>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs font-normal text-slate-500"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(post)}
                    className="text-slate-400 hover:text-slate-600"
                    title={post.published ? "Unpublish" : "Publish"}
                  >
                    {post.published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="text-slate-400 hover:text-slate-600"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-slate-400 hover:text-slate-600"
                    title="View"
                  >
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-slate-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No posts yet</p>
          <Button onClick={handleCreateNew} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create your first post
          </Button>
        </div>
      )}
    </div>
  );
}
