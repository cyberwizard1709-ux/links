# Link Directory

A minimal link directory built with Next.js and shadcn/ui.

## Features

- 🔗 **Simple Link Directory** - Links organized by category
- 📝 **Ghost Blog Integration** - Displays blog posts from Ghost CMS
- 🔐 **Admin Panel** - Add/remove categories and links
- 🎨 **Clean UI** - Minimal design with shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite (Prisma ORM)
- **Auth**: NextAuth.js
- **Blog**: Ghost CMS (Content API)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Seed Initial Data

```bash
# Start the dev server
npm run dev

# In another terminal, seed the data
curl -X POST http://localhost:3000/api/seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Default Admin Login

- **URL**: http://localhost:3000/admin
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Ghost CMS Setup (Optional)

To enable the blog feature:

1. **Set up Ghost**: Use Ghost Pro or self-hosted
2. **Get API Key**: Go to Ghost Admin → Settings → Integrations
3. **Configure .env**:

```env
GHOST_URL="https://your-ghost-blog.com"
GHOST_CONTENT_API_KEY="your-content-api-key"
```

**Note**: This app only reads from Ghost CMS. To publish blog posts, use the Ghost Admin interface directly at your Ghost instance.

## Admin Features

- **Add Category**: Just enter the category name
- **Add Link**: Enter URL and select category
- **Delete**: Remove links or categories (with all their links)

## Project Structure

```
app/
├── page.tsx           # Homepage (links by category)
├── layout.tsx         # Root layout with minimal navbar
├── blog/              # Blog pages (Ghost integration)
├── admin/             # Admin panel
└── api/               # API routes
```
