"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Link2, FileText, Eye } from "lucide-react";

interface Stats {
  categories: number;
  links: number;
  posts: number;
  totalViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    categories: 0,
    links: 0,
    posts: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [categoriesRes, postsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/admin/blog/posts"),
      ]);

      let categoriesCount = 0;
      let linksCount = 0;
      let postsCount = 0;
      let totalViews = 0;

      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        categoriesCount = categories.length;
        linksCount = categories.reduce((acc: number, cat: { links: unknown[] }) => acc + cat.links.length, 0);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const posts = postsData.posts || [];
        postsCount = posts.length;
        totalViews = posts.reduce((acc: number, post: { viewCount: number }) => acc + (post.viewCount || 0), 0);
      }

      setStats({
        categories: categoriesCount,
        links: linksCount,
        posts: postsCount,
        totalViews,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Categories", value: stats.categories, icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Links", value: stats.links, icon: Link2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Blog Posts", value: stats.posts, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Total Views", value: stats.totalViews, icon: Eye, color: "text-orange-600", bg: "bg-orange-50" },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your directory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
