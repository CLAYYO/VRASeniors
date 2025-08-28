import type { ContentItem } from '../config';
import contentData from '../data/vra_seniors_site_content.json';

// Generate URL-safe slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Get all content items with generated slugs
export function getAllContent(): ContentItem[] {
  return (contentData as ContentItem[]).map(item => ({
    ...item,
    slug: item.slug || generateSlug(item.title)
  }));
}

// Get content by page/section
export function getContentByPage(page: string): ContentItem | undefined {
  const content = getAllContent();
  return content.find(item => item.page === page);
}

// Get content by section and slug
export function getContentBySlug(section: string, slug: string): ContentItem | undefined {
  const content = getAllContent();
  return content.find(item => {
    const itemSlug = item.slug || generateSlug(item.title);
    return itemSlug === slug && isInSection(item.page, section);
  });
}

// Check if a page belongs to a section
export function isInSection(page: string, section: string): boolean {
  const sectionMappings: Record<string, string[]> = {
    golf: [
      'weekly_competitions',
      'matches', 
      'knockouts',
      'exchange_days',
      'rider_cup',
      'friendlies',
      'whs',
      'whs_conversion_tables'
    ],
    portfolio: [
      'introduction',
      'seniors_benefits',
      'operating_guidelines',
      'committee_structure',
      'inter_club_matches_portfolio',
      'seniors_competitions',
      'financial_operation',
      'seniors_invitation',
      'hall_of_fame'
    ],
    administration: [
      'vra_constitution',
      'document_tracker',
      'prize_structure',
      'annual_meeting_minutes',
      'photo_gallery'
    ]
  };
  
  return sectionMappings[section]?.includes(page) || false;
}

// Get all content for a section
export function getContentBySection(section: string): ContentItem[] {
  const content = getAllContent();
  return content.filter(item => isInSection(item.page, section));
}

// Get section name from page
export function getSectionFromPage(page: string): string | undefined {
  const sections = ['golf', 'portfolio', 'administration'];
  return sections.find(section => isInSection(page, section));
}

// Sanitize HTML content
export function sanitizeContent(content: string): string {
  // Basic HTML sanitization - in production, consider using a proper sanitization library
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

// Decode HTML entities and prepare content for rendering
export function prepareHtmlContent(content: string): string {
  // Decode common HTML entities
  return content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Extract year from filename or content
export function extractYear(item: ContentItem): number | undefined {
  if (item.year) {
    const year = parseInt(item.year);
    if (!isNaN(year)) return year;
  }
  
  if (item.date) {
    const year = new Date(item.date).getFullYear();
    if (!isNaN(year)) return year;
  }
  
  // Try to extract year from title or content
  const yearMatch = (item.title + ' ' + item.content).match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  return undefined;
}

// Get latest content items for homepage
export function getLatestContent(limit: number = 5): ContentItem[] {
  const content = getAllContent();
  return content
    .filter(item => item.page !== 'home')
    .map(item => ({ ...item, year: extractYear(item)?.toString() }))
    .filter(item => item.year)
    .sort((a, b) => {
      const yearA = parseInt(a.year || '0');
      const yearB = parseInt(b.year || '0');
      return yearB - yearA;
    })
    .slice(0, limit);
}

// Search content
export function searchContent(query: string): ContentItem[] {
  if (!query.trim()) return [];
  
  const content = getAllContent();
  const searchTerm = query.toLowerCase();
  
  return content.filter(item => {
    const searchableText = [
      item.title,
      item.content,
      ...(item.pdfs?.map(pdf => pdf.name) || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
}

// Get breadcrumb trail
export function getBreadcrumbs(section?: string, pageTitle?: string): Array<{label: string, href: string}> {
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  // Handle special pages
  if (section === 'contact') {
    breadcrumbs.push({ label: 'Contact Us', href: '/contact' });
    return breadcrumbs;
  }
  
  if (section === 'hall-of-fame') {
    breadcrumbs.push({ label: 'Hall of Fame', href: '/hall-of-fame' });
    return breadcrumbs;
  }
  
  if (section) {
    const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
    breadcrumbs.push({ label: sectionLabel, href: `/${section}` });
  }
  
  if (pageTitle && section) {
    const slug = generateSlug(pageTitle);
    breadcrumbs.push({ label: pageTitle, href: `/${section}/${slug}` });
  }
  
  return breadcrumbs;
}