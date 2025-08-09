export const config = {
  // Path to the JSON content file - update this to change the data source
  contentDataPath: '/src/data/vra_seniors_site_content.json',
  
  // Site configuration
  site: {
    title: 'Vale Royal Abbey Golf Club - Seniors Section',
    description: 'Official website for the Vale Royal Abbey Golf Club Seniors Section',
    email: 'seniors@vragc.co.uk',
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  
  // Navigation structure
  navigation: {
    primary: [
      { label: 'Home', href: '/' },
      { label: 'Golf', href: '/golf' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Administration', href: '/administration' },
      { label: 'Hall of Fame', href: '/hall-of-fame' },
      { label: 'Contact', href: 'mailto:seniors@vragc.co.uk' }
    ]
  },
  
  // Section mappings for routing
  sections: {
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
  }
};

export type ContentItem = {
  page: string;
  title: string;
  content: string;
  pdfs?: Array<{
    name: string;
    filename: string;
    year?: string;
    type?: string;
  }>;
  links?: Array<{
    label: string;
    url: string;
    type: 'internal' | 'pdf' | 'external';
  }>;
  year?: string;
  date?: string;
  slug?: string;
};