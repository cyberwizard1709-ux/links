"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Type, Image, FileText, Save } from "lucide-react";

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  faviconUrl: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: "LinkDirectory",
    siteDescription: "A curated directory of useful links",
    faviconUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: keyof SiteSettings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settings[key] }),
      });

      if (res.ok) {
        toast.success("Setting saved! Refresh the page to see changes.");
        // Refresh settings to sync
        fetchSettings();
      } else {
        toast.error("Failed to save setting");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Customize your directory appearance</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Site Title */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Type className="w-4 h-4 text-slate-400" />
              Site Title
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteTitle">Title displayed in the navbar</Label>
              <Input
                id="siteTitle"
                value={settings.siteTitle}
                onChange={(e) => updateSetting("siteTitle", e.target.value)}
                placeholder="LinkDirectory"
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("siteTitle")}
                disabled={saving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Site Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-slate-400" />
              Site Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteDescription">
                Description for SEO and meta tags
              </Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting("siteDescription", e.target.value)}
                placeholder="A curated directory of useful links"
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("siteDescription")}
                disabled={saving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Favicon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Image className="w-4 h-4 text-slate-400" />
              Favicon URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="faviconUrl">
                URL to your favicon image (recommended: 32x32px)
              </Label>
              <Input
                id="faviconUrl"
                value={settings.faviconUrl}
                onChange={(e) => updateSetting("faviconUrl", e.target.value)}
                placeholder="https://example.com/favicon.ico"
                className="mt-1.5"
              />
            </div>
            {settings.faviconUrl && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Preview:</span>
                <img
                  src={settings.faviconUrl}
                  alt="Favicon preview"
                  className="w-6 h-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("faviconUrl")}
                disabled={saving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
