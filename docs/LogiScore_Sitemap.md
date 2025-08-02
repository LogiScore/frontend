# LogiScore Website Sitemap

## Public Pages (Unauthenticated Users)

### 1. Homepage
- **URL:** `/`
- **Purpose:** Landing page, platform overview
- **Key Elements:**
  - Hero section with value proposition
  - How it works (3-step process)
  - Featured forwarders
  - Testimonials
  - Call-to-action buttons (Search, Sign Up)

### 2. About Us
- **URL:** `/about`
- **Purpose:** Company information, mission, team
- **Key Elements:**
  - Company story and mission
  - Team information
  - Contact details
  - Press/media kit

### 3. How It Works
- **URL:** `/how-it-works`
- **Purpose:** Detailed explanation of platform
- **Key Elements:**
  - Step-by-step process for shippers
  - Step-by-step process for forwarders
  - Rating system explanation
  - Sample reviews

### 4. Search & Browse
- **URL:** `/search`
- **Purpose:** Find forwarders
- **Key Elements:**
  - Search by company name
  - Filter by location/country
  - Filter by rating
  - Sort options (rating, review count, name)
  - Map view option

### 5. Forwarder Profile Pages
- **URL:** `/forwarder/[company-slug]`
- **Purpose:** Individual forwarder profiles
- **Key Elements:**
  - Company overview
  - Overall rating and review count
  - Branch locations (limited info for free users)
  - Contact information
  - "Write Review" CTA

### 6. Branch Profile Pages
- **URL:** `/forwarder/[company-slug]/[branch-slug]`
- **Purpose:** Individual branch profiles
- **Key Elements:**
  - Branch-specific rating
  - Category breakdowns (Pro users only)
  - Individual reviews (Pro users only)
  - Branch contact information

### 7. Pricing
- **URL:** `/pricing`
- **Purpose:** Subscription plans and pricing
- **Key Elements:**
  - Shipper plans (Free vs Pro)
  - Forwarder plans (Free vs Insights vs Reputation+)
  - Feature comparison table
  - FAQ about pricing
  - Contact sales for enterprise

### 8. Help & Support
- **URL:** `/help`
- **Purpose:** Support resources
- **Key Elements:**
  - FAQ (links to dedicated FAQ page)
  - Contact support
  - Community guidelines (links to dedicated page)
  - Video tutorials
  - Knowledge base

### 9. FAQ
- **URL:** `/faq`
- **Purpose:** Frequently asked questions
- **Key Elements:**
  - Review guidelines
  - Dispute process
  - Account management
  - Data & privacy
  - Liability & legal

### 10. Community Guidelines
- **URL:** `/guidelines`
- **Purpose:** Platform rules and standards
- **Key Elements:**
  - Core principles
  - Review standards
  - Prohibited content
  - Enforcement
  - Appeals process

### 11. Privacy Policy
- **URL:** `/privacy`
- **Purpose:** Data protection and privacy
- **Key Elements:**
  - Data collection practices
  - User rights
  - Cookie policy
  - Contact information

### 12. Terms of Service
- **URL:** `/terms`
- **Purpose:** Legal terms and conditions
- **Key Elements:**
  - User obligations
  - Platform rules
  - Dispute resolution
  - Liability limitations

### 13. Contact Us
- **URL:** `/contact`
- **Purpose:** Contact information and forms
- **Key Elements:**
  - General contact form
  - Sales inquiries
  - Support requests
  - Office locations

### 14. Blog/News
- **URL:** `/blog`
- **Purpose:** Industry insights and platform updates
- **Key Elements:**
  - Industry trends
  - Platform updates
  - Case studies
  - Expert insights

## Authenticated User Pages

### 15. User Dashboard
- **URL:** `/dashboard`
- **Purpose:** Main user hub
- **Key Elements:**
  - Recent activity
  - Quick actions
  - Notifications
  - Account summary

### 16. Profile Management
- **URL:** `/profile`
- **Purpose:** User account settings
- **Key Elements:**
  - Personal information
  - Company details
  - Notification preferences
  - Privacy settings
  - Account deletion

### 17. Review Management
- **URL:** `/reviews`
- **Purpose:** Manage user's reviews
- **Key Elements:**
  - Review history
  - Edit/update reviews
  - Review status
  - Draft reviews

### 18. Write Review
- **URL:** `/write-review`
- **Purpose:** Submit new review
- **Key Elements:**
  - Company/branch selection
  - Rating questions
  - Anonymity options
  - Review preview
  - Submission confirmation

### 19. Forwarder Dashboard (Forwarder Users)
- **URL:** `/forwarder-dashboard`
- **Purpose:** Forwarder-specific dashboard
- **Key Elements:**
  - Company overview
  - Branch performance
  - Recent reviews
  - Response management
  - Analytics summary

### 20. Review Responses (Forwarder Users)
- **URL:** `/reviews/responses`
- **Purpose:** Respond to reviews
- **Key Elements:**
  - Pending responses
  - Response history
  - Response guidelines
  - Response templates

### 21. Analytics (Paid Users)
- **URL:** `/analytics`
- **Purpose:** Performance analytics
- **Key Elements:**
  - Score trends
  - Category breakdowns
  - Competitor benchmarking
  - Custom reports
  - Export options

### 22. Invitations (Reputation+ Users)
- **URL:** `/invitations`
- **Purpose:** Manage review invitations
- **Key Elements:**
  - Send invitations
  - Invitation status
  - Response tracking
  - Template management

### 23. Reports (Paid Users)
- **URL:** `/reports`
- **Purpose:** Generate and download reports
- **Key Elements:**
  - Report templates
  - Custom date ranges
  - Export options (PDF, Excel)
  - Scheduled reports

### 24. Advertising (Forwarder Users)
- **URL:** `/advertising`
- **Purpose:** Manage ad campaigns
- **Key Elements:**
  - Campaign overview
  - Ad creation
  - Performance metrics
  - Billing information

### 25. Disputes (Forwarder Users)
- **URL:** `/disputes`
- **Purpose:** Manage review disputes
- **Key Elements:**
  - Submit disputes
  - Dispute status
  - Evidence upload
  - Communication history

## Admin Pages

### 26. Admin Dashboard
- **URL:** `/admin`
- **Purpose:** Admin control panel
- **Key Elements:**
  - Platform overview
  - Recent activity
  - Pending actions
  - System health

### 27. Review Moderation
- **URL:** `/admin/moderation`
- **Purpose:** Moderate reviews
- **Key Elements:**
  - Flagged reviews
  - Dispute management
  - Review approval/rejection
  - User management

### 28. User Management
- **URL:** `/admin/users`
- **Purpose:** Manage user accounts
- **Key Elements:**
  - User search
  - Account status
  - Ban/unban users
  - User activity logs

### 29. Company Management
- **URL:** `/admin/companies`
- **Purpose:** Manage forwarder companies
- **Key Elements:**
  - Company profiles
  - Branch management
  - Verification status
  - Data cleanup

### 30. Analytics & Reporting
- **URL:** `/admin/analytics`
- **Purpose:** Platform analytics
- **Key Elements:**
  - Platform metrics
  - User growth
  - Review activity
  - Revenue reports

## API Endpoints

### 31. Public API
- **URL:** `/api/v1/`
- **Purpose:** Public data access
- **Key Elements:**
  - Company search
  - Review data (limited)
  - Rating information
  - Documentation

### 32. Authenticated API
- **URL:** `/api/v1/`
- **Purpose:** User-specific data
- **Key Elements:**
  - User reviews
  - Company management
  - Analytics data
  - Report generation

## SEO & Technical Pages

### 33. XML Sitemap
- **URL:** `/sitemap.xml`
- **Purpose:** Search engine indexing
- **Key Elements:**
  - All public pages
  - Update frequency
  - Priority levels

### 34. Robots.txt
- **URL:** `/robots.txt`
- **Purpose:** Search engine crawling
- **Key Elements:**
  - Crawl directives
  - Sitemap location
  - Protected areas

### 35. Security Pages
- **URL:** `/security`
- **Purpose:** Security information
- **Key Elements:**
  - Security practices
  - Bug bounty program
  - Vulnerability reporting
  - Security contact

## Navigation Structure

### Main Navigation
```
Home
├── Search
├── About
├── How It Works
├── Pricing
├── Help
└── Contact
```

### User Menu (Authenticated)
```
Dashboard
├── Profile
├── Reviews
├── Analytics (if paid)
├── Reports (if paid)
└── Settings
```

### Footer Navigation
```
Company
├── About
├── Careers
├── Press
└── Contact

Platform
├── How It Works
├── Pricing
├── Features
└── API

Support
├── Help Center
├── FAQ
├── Guidelines
└── Contact Support

Legal
├── Privacy Policy
├── Terms of Service
├── Cookie Policy
└── Security
```

## URL Structure Guidelines

### Forwarder URLs
- Company: `/forwarder/[company-slug]`
- Branch: `/forwarder/[company-slug]/[branch-slug]`
- Reviews: `/forwarder/[company-slug]/reviews`

### User URLs
- Dashboard: `/dashboard`
- Profile: `/profile`
- Reviews: `/reviews`
- Write Review: `/write-review`

### Admin URLs
- Dashboard: `/admin`
- Moderation: `/admin/moderation`
- Users: `/admin/users`
- Analytics: `/admin/analytics`

## Mobile Navigation

### Mobile Menu Structure
```
☰ Menu
├── Search
├── Browse Forwarders
├── Write Review
├── My Reviews
├── Dashboard
├── Help & Support
└── Account Settings
```

## Breadcrumb Navigation

### Example Breadcrumbs
- Home > Search > Forwarders > Company Name > Branch Name
- Home > Dashboard > Reviews > Write Review
- Home > Help > FAQ > Review Guidelines

## Search & Filter Navigation

### Search Results Page
- **URL:** `/search?q=[query]&location=[location]&rating=[rating]`
- **Filters:** Location, Rating, Review Count, Service Type
- **Sort Options:** Rating, Name, Review Count, Distance

## User Flow Navigation

### New User Flow
1. Homepage → Learn More → How It Works → Sign Up → Dashboard
2. Homepage → Search → Company Profile → Write Review → Sign Up

### Returning User Flow
1. Login → Dashboard → Write Review → Submit → Confirmation
2. Login → Search → Company Profile → View Reviews → Write Review

### Forwarder User Flow
1. Login → Forwarder Dashboard → View Reviews → Respond to Reviews
2. Login → Analytics → Generate Reports → Download Reports

This sitemap provides a comprehensive navigation structure for the LogiScore platform, ensuring good user experience and SEO optimization. 