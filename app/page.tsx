"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function normalizeUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

function getDomain(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    return new URL(normalized).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

const MAX_VISIBLE_LINKS = 6;

function CategoryCard({ category }: { category: Category }) {
  const [expanded, setExpanded] = useState(false);
  const hasMoreLinks = category.links.length > MAX_VISIBLE_LINKS;
  const visibleLinks = expanded 
    ? category.links 
    : category.links.slice(0, MAX_VISIBLE_LINKS);

  const handleLinkClick = async (linkId: string, url: string) => {
    const normalizedUrl = normalizeUrl(url);
    try {
      await fetch(`/api/links/${linkId}`, { method: "PATCH" });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
    window.open(normalizedUrl, "_blank");
  };

  return (
    <Card className="h-full border-slate-200/60 shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-slate-700 uppercase tracking-wide flex items-center justify-between">
          <span>{category.name}</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {category.links.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-1 flex-1">
          {visibleLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors group"
              onClick={() => handleLinkClick(link.id, link.url)}
            >
              <Link2 className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 truncate flex-1 group-hover:text-slate-900">
                {getDomain(link.url)}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          ))}
          {category.links.length === 0 && (
            <p className="text-sm text-slate-400 py-2 italic">No links yet</p>
          )}
        </div>
        
        {hasMoreLinks && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-slate-500 hover:text-slate-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show {category.links.length - MAX_VISIBLE_LINKS} more
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
