# Vale Royal Abbey Golf Club - Seniors' Section Website

A fast, accessible website built with Astro for the Vale Royal Abbey Golf Club Seniors' Section. The site uses a single JSON file as the source of truth for all content, making it easy to update and maintain.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Breadcrumbs.astro
│   ├── DocList.astro
│   ├── Footer.astro
│   ├── Navigation.astro
│   ├── PageHeader.astro
│   ├── PdfLink.astro
│   ├── SearchModal.astro
│   └── SidebarNav.astro
├── data/               # Content data
│   └── vra_seniors_site_content.json
├── layouts/            # Page layouts
│   └── BaseLayout.astro
├── pages/              # Site pages (file-based routing)
│   ├── administration/
│   ├── golf/
│   ├── portfolio/
│   ├── 404.astro
│   ├── hall-of-fame.astro
│   └── index.astro
├── utils/              # Utility functions
│   └── data.ts
├── config.ts           # Site configuration
└── env.d.ts           # TypeScript definitions
```

## 📝 Content Management

### Updating Content

The entire website content is managed through a single JSON file:
**`src/data/vra_seniors_site_content.json`**

To update content:
1. Replace the JSON file with your updated version
2. Rebuild the site (`npm run build`)
3. Deploy the updated site

### JSON Structure

Each content item should follow this structure:

```json
{
  "page": "golf",           // Section: golf, portfolio, administration, home
  "title": "Page Title",    // Display title
  "slug": "page-slug",      // URL slug (auto-generated if missing)
  "content": "<p>HTML content...</p>", // Main content (HTML or plain text)
  "year": "2024",          // Year for filtering/sorting
  "pdfs": [                // Associated PDF documents
    {
      "name": "Document Name",
      "filename": "document.pdf",
      "year": "2024"
    }
  ]
}
```

### Slug Generation

- Slugs are auto-generated from titles if not provided
- Format: kebab-case (e.g., "Weekly Competitions" → "weekly-competitions")
- Manual slugs override auto-generation

### Content Sections

The site is organized into these main sections:

#### Golf (`/golf`)
- Weekly Competitions
- Matches
- Knock Outs
- Exchange Days
- Rider Cup
- Friendlies
- World Handicap System
- WHS Conversion Tables

#### Portfolio (`/portfolio`)
- Introduction
- Seniors Benefits
- Operating Guidelines
- Committee Structure
- Inter Club Matches
- Seniors Competitions
- Financial Operation
- Seniors Invitation
- Hall of Fame

#### Administration (`/administration`)
- VRA Constitution
- Document Tracker
- Prize Structure
- Annual Meeting Minutes
- Photo Gallery

## 🎨 Design System

### Colors
- Primary: Deep green (`#059669`)
- Secondary: Gray tones
- Background: Light gray (`#f9fafb`)
- Text: Dark gray (`#111827`)

### Components

#### PageHeader
Displays page title, optional description, and year filter
```astro
<PageHeader 
  title="Page Title"
  description="Optional description"
  showYearFilter={true}
  availableYears={['2024', '2023']}
  currentYear="2024"
/>
```

#### DocList
Displays documents with filtering and sorting
```astro
<DocList 
  documents={pdfs}
  showYearFilter={true}
  viewMode="grid"
/>
```

#### PdfLink
Renders a PDF link with modal viewer
```astro
<PdfLink 
  name="Document Name"
  filename="document.pdf"
  year="2024"
  showYear={true}
/>
```

## 🔍 Search Functionality

- Global search available in header
- Searches titles, content, and PDF names
- Results grouped by section
- Debounced input for performance

## 📱 Accessibility Features

- WCAG AA+ compliant
- Keyboard navigation support
- Screen reader friendly
- Skip-to-content links
- Proper heading hierarchy
- High contrast colors
- Focus indicators

## 🔗 PDF Handling

PDFs are handled through a modal viewer:
- Click any PDF link to open in modal
- No forced downloads
- Responsive viewer
- Keyboard accessible (ESC to close)

PDF files should be placed in the `public/pdfs/` directory and referenced in the JSON with just the filename.

## 🌐 SEO & Performance

- Static site generation (SSG)
- Automatic sitemap generation
- Meta tags and descriptions
- JSON-LD structured data
- Optimized images and assets
- Fast loading times

## 🛠️ Configuration

Site configuration is managed in `src/config.ts`:

```typescript
export const SITE_CONFIG = {
  title: "Vale Royal Abbey Golf Club - Seniors",
  description: "Official website for the Seniors' Section",
  email: "seniors@vragc.co.uk",
  url: "https://seniors.vragc.co.uk"
};
```

## 📊 Data Utilities

The `src/utils/data.ts` file provides functions for:
- Content filtering and searching
- Slug generation
- Section categorization
- Year-based sorting
- Breadcrumb generation

## 🚀 Deployment

1. Build the site: `npm run build`
2. Deploy the `dist/` folder to your web server
3. Ensure PDF files are accessible in the `/pdfs/` path

## 🔄 Content Updates Workflow

1. **Prepare your content** in the JSON format
2. **Validate the JSON** structure
3. **Replace** `src/data/vra_seniors_site_content.json`
4. **Test locally** with `npm run dev`
5. **Build** with `npm run build`
6. **Deploy** the `dist/` folder

## 📋 Content Guidelines

- Use HTML for rich content formatting
- Include year information for time-based content
- Provide descriptive PDF names
- Keep titles concise but descriptive
- Use consistent naming conventions

## 🐛 Troubleshooting

### Common Issues

1. **Missing PDFs**: Ensure PDF files are in `public/pdfs/` directory
2. **Broken links**: Check slug generation and routing
3. **Search not working**: Verify JSON structure and content fields
4. **Styling issues**: Check Tailwind classes and responsive design

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run astro        # Run Astro CLI commands
```

## 📞 Support

For technical issues or questions about content updates, contact the development team or refer to the [Astro documentation](https://docs.astro.build/).

---

Built with ❤️ using [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/)
