"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen, Link2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  links: LinkItem[];
}

interface LinkItem {
  id: string;
  url: string;
  clicks: number;
  categoryId: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function LinksPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLinkUrls, setNewLinkUrls] = useState("");
  const [newLinkCategoryId, setNewLinkCategoryId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (res.ok) {
        toast.success("Category created");
        setNewCategoryName("");
        fetchData();
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleCreateLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrls.trim() || !newLinkCategoryId) return;

    const urls = newLinkUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      toast.error("Please enter at least one URL");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const url of urls) {
      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, categoryId: newLinkCategoryId }),
        });

        if (res.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) toast.success(`Added ${successCount} link(s)`);
    if (errorCount > 0) toast.error(`Failed to add ${errorCount} link(s)`);

    setNewLinkUrls("");
    setNewLinkCategoryId("");
    fetchData();
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Link deleted");
        fetchData();
      } else {
        toast.error("Failed to delete link");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its links?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete category error:", errorData);
        toast.error(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete category exception:", error);
      toast.error("An error occurred while deleting");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Links</h1>
        <p className="text-slate-500">Manage your categories and links</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Add Category */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-5 h-5 text-slate-400" />
                <h2 className="font-semibold">Add Category</h2>
              </div>
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Links */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-slate-400" />
                <h2 className="font-semibold">Add Links</h2>
              </div>
              <form onSubmit={handleCreateLinks} className="space-y-4">
                <Textarea
                  placeholder="Enter URLs (one per line)&#10;https://example.com&#10;https://another.com"
                  value={newLinkUrls}
                  onChange={(e) => setNewLinkUrls(e.target.value)}
                  rows={5}
                />
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={newLinkCategoryId}
                  onChange={(e) => setNewLinkCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Links
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Categories</h2>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-slate-400" />
                        <h3 className="font-medium">{category.name}</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {category.links.length}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {category.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-2 rounded-md bg-slate-50 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Link2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate">
                              {getDomain(link.url)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                            onClick={() => deleteLink(link.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      {category.links.length === 0 && (
                        <p className="text-sm text-slate-400 py-2 italic">
                          No links in this category
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No categories yet. Create one to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
