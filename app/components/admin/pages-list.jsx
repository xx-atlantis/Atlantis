"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data - in real app, this comes from API
const mockPages = [
  {
    id: 1,
    title: "Home",
    slug: "/",
    languages: ["en", "ar"],
    lastModified: "2024-11-10",
  },
  {
    id: 2,
    title: "About",
    slug: "/about",
    languages: ["en", "ar"],
    lastModified: "2024-11-08",
  },
  {
    id: 3,
    title: "Contact",
    slug: "/contact",
    languages: ["en", "ar"],
    lastModified: "2024-11-05",
  },
  {
    id: 4,
    title: "Services",
    slug: "/services",
    languages: ["en", "ar"],
    lastModified: "2024-11-01",
  },
];

export default function PagesList({ onSelectPage }) {
  const [pages, setPages] = useState(mockPages);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    // In real app, call DELETE /api/pages/:id
    setPages(pages.filter((p) => p.id !== id));
  };

  const handleCreatePage = () => {
    // In real app, open a dialog to create new page
    const newPage = {
      id: Math.max(...pages.map((p) => p.id)) + 1,
      title: "New Page",
      slug: "/new-page",
      languages: ["en", "ar"],
      lastModified: new Date().toISOString().split("T")[0],
    };
    onSelectPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage your website pages and content
          </p>
        </div>
        <Button onClick={handleCreatePage} className="gap-2">
          <Plus className="w-4 h-4" />
          New Page
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search pages by title or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid gap-4">
        {filteredPages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pages found</p>
            </CardContent>
          </Card>
        ) : (
          filteredPages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {page.slug}
                      </code>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectPage(page)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    {page.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground"
                      >
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    Modified: {page.lastModified}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Import icons if you use them (e.g., Lucide or FontAwesome)
import { Users, FileText, Settings, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Blogs/Content', href: '/admin/blogs', icon: FileText },
  { name: 'Staff Access', href: '/admin/staff', icon: Users }, // <-- ADD THIS
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <div className="mb-8 font-bold text-xl">Admin Panel</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              pathname === item.href ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}