# LogiScore – Product & Business Documentation

---

## 1. Overview
LogiScore is a review platform where **shippers** rate **freight forwarders** on service quality, professionalism, and operational capability at the **branch level**. The system is inspired by platforms like Glassdoor but tailored to the logistics industry. The goal is to provide a transparent, data-driven view of forwarder performance across multiple categories, supporting both public and private reviews, and offering monetization via subscriptions and advertising.

**Domain**: logiscore.net
**Contact**: info@logiscore.net
**Support**: support@logiscore.net
**Disputes**: disputes@logiscore.net

---

## 2. User Roles & Access

### 2.1 Shippers (Reviewers)
- Submit reviews (free for first 6 months)
- View overall company score (Free)
- Access branch-level and detailed reviews (Pro subscription)
- Choose anonymity (50% weight) or verification (100% weight, name/company shown)
- Edit or withdraw past reviews
- Download their own rating reports (PDF) (Pro subscription)

### 2.2 Forwarders (Reviewed)
- View corporate-level score (Free)
- Subscribe to view branch-level scores and public reviews (Insights tier)
- Invite customers to review (Reputation+ tier)
- Purchase ad space (general or targeted)
- Claim branch profiles and respond to reviews (Insights tier)

### 2.3 Admins
- Moderate and manage reviews
- Standardize corporate names via mapping/suggestions
- Consolidate reviews from same corporate
- Toggle subscription mode for shippers
- Manage advertising campaigns (upload banners, track impressions)
- Resolve flagged or disputed reviews

---

## 3. Rating System & Questions

### 3.1 Categories
- Responsiveness
- Shipment Management
- Documentation Accuracy
- Customer Experience
- Tech & Process
- Reliability & Execution
- Proactivity & Insight
- After-Hours Support (optional)

Each category contains 4–6 objective, multiple-choice questions with weighted scoring (0 to 4). Each question is assigned a unique code (e.g., Q1.1, Q2.3) for reference. Optional questions can be marked N/A.

### 3.2 Scoring Scale
- 4 = 100% (Always/Every time)
- 3 = 75% (Most of the time)
- 2 = 50% (Usually/Some of the time)
- 1 = 25% (Rarely/Hardly ever)
- 0 = 0% (Never/Not provided/Not applicable)
- N/A = Not required (for optional categories only)

### 3.3 Example Questions
(See full question set in Appendix A)

---

## 4. Review Visibility & Subscription

- Public reviews only visible if ≥ 3 reviews for that branch; otherwise, marked as “Preliminary Score – Limited Data.”
- Reviews are weighted: Verified = 100% weight (name shown), Anonymous = 50% weight.
- Each company can submit one review per branch every 90 days; multiple users from the same company are consolidated or flagged.

### 4.1 Shipper Access Levels
| Plan | Price | Features |
|------|--------|----------|
| Free | $0 | View company-level score, submit reviews (FOC 6 months) |
| Pro  | $99/month / $990/year | View branch-level reviews and scores, full review insights |

**Free Plan Features:**
- View overall company scores (aggregated across all branches)
- Submit unlimited reviews (first 6 months free, then requires Pro), however only 1 review per corporate branch
- Basic search by company name
- View "Preliminary Score" warnings for branches with <3 reviews
- Anonymous or verified review submission (50% vs 100% weight)
- Edit own reviews within 24 hours of submission

**Pro Plan Features:**
- All Free features
- View detailed branch-level scores and individual review breakdowns
- Access to category-specific scores (Responsiveness, Documentation, etc.)
- View individual review details (excluding anonymous reviewer names)
- Download personal review history as PDF reports
- Advanced search filters (by country, rating, review count)
- Compare multiple branches side-by-side
- Historical score trends and performance analytics
- Priority customer support
- No review submission limits after 6-month free period

### 4.2 Forwarder Access Levels
| Plan | Price | Features |
|------|--------|----------|
| Free | $0 | View company-level score only |
| Insights | $99/month / $990/year | View branch-level scores, public reviews, competitor benchmarks |
| Reputation+ | $2,999/year | Includes Insights + client review invites + white-labeled reports + alerts |

**Free Plan Features:**
- View own company's overall aggregated score
- Basic company profile information
- No access to individual branch scores or reviews
- No competitor benchmarking
- No review management tools

**Insights Plan Features:**
- All Free features
- View detailed scores for all company branches
- Read individual public reviews (excluding anonymous reviewer details)
- Access to category-specific performance breakdowns
- Competitor benchmarking against industry averages
- Branch performance analytics and trends
- Review response capabilities (claim and respond to reviews)
- Email alerts when new reviews are posted
- Basic reporting dashboard
- Customer support

**Reputation+ Plan Features:**
- All Insights features
- Private client review invitation system
- White-labeled performance reports for clients
  - Custom-branded reports that forwarders can send to their clients
  - LogiScore data presented under the forwarder's own branding (logo, colors, company name)
  - Professional PDF reports showing the forwarder's performance scores and metrics
  - No LogiScore branding visible - appears as if the forwarder created the report themselves
  Use Cases:
  - Client Presentations - Show performance data during quarterly reviews
  - RFP Responses - Include performance metrics in bid proposals
  - Client Retention - Demonstrate service quality with objective data
  - Internal Reporting - Share with management or sales teams
- Advanced analytics and custom reporting
  Advanced Analytics:
  - Trend Analysis - Performance over time (monthly/quarterly trends)
  - Predictive Insights - Score forecasting based on historical data
  - Root Cause Analysis - Why scores are improving/declining
  - Benchmarking - How you compare to competitors in your region/lane
  - Correlation Analysis - Which factors most impact overall scores
  Custom Reporting:
  - Date Range Selection - Custom time periods for analysis
  - Filtered Views - Reports by specific branches, regions, or service types
  - Export Options - PDF, Excel, CSV formats
  - Scheduled Reports - Automated delivery to stakeholders
  - Dashboard Customization - Choose which metrics to display
  Example Use Cases:
  - "Show me our performance in Asia-Pacific over the last 6 months"
  - "Compare our Documentation scores vs competitors in the same trade lane"
  - "Generate a quarterly report for our board meeting"
  - "Alert me when any branch score drops below 3.5 stars"
- Priority review moderation (faster dispute resolution)
  - Faster response times - Disputes reviewed within 24-48 hours (vs. 5-7 days for regular users)
  - Priority queue - Disputed reviews moved to the front of the moderation line
  - Dedicated support - Direct access to moderation team for complex cases
  - Escalation path - Immediate escalation for urgent disputes
  Typical Dispute Scenarios:
  - Fake/Spam Reviews - Competitors posting false reviews
  - Inappropriate Content - Reviews violating platform guidelines
  - Factual Errors - Incorrect information about services
  - Anonymous Abuse - Malicious anonymous reviews
  - Duplicate Reviews - Same company posting multiple reviews
  Process Difference:
  - Regular Users:
  - Submit dispute → Wait 5-7 days → Standard review → Decision
  - Reputation+ Users:
  - Submit dispute → Priority flag → 24-48 hour review → Expedited decision
- Custom alert thresholds and notifications
- Bulk review management tools
- Advanced competitor analysis and market insights

---

## 5. Advertising
Forwarders can purchase ads:
- **General Ads** – Homepage, search results ($499/month)
- **Country-Level Ads** – Country-specific review/search pages ($199/month/country)
- **Branch-Level Ads** – Branch review pages ($99/month/branch)
- **Featured Profiles** – Top of search results ($149/month)

---

## 6. Technical Implementation
For technical architecture, database schema, API endpoints, and security details, see the separate **LogiScore Technical Documentation**.

---

## 7. Roadmap Features (Phase 2+)
- Benchmarking by lane/product/region
- Data export for shippers/forwarders
- Integrations with ERP/CRM systems
- Alerts for low-performing branches
- Reviewer incentives or loyalty program
- Vendor alerts when score drops below threshold
- Reviewer badges or access unlocks

---

## 8. Support & Contributions
- Technical issues: open GitHub issue
- Security reports: security@logiscore.net
- Roadmap & PRs: see `/docs/roadmap.md` in repo
- Help Center: logiscore.net/help
- Branch disputes: support@logiscore.net

---

## 9. Dispute resolution process
Key Features Added:
- Dispute tracking with workflow status
- Admin notifications via disputes@logiscore.com
- Corporate identification for priority handling
- User identification (IP tracking for anonymous, GitHub OAuth for registered)
- Review history access for admin investigation
- User blocking capability for abusive users
Technical Implementation:
- Database tables for disputes and user sessions
- Workflow process from submission to resolution
- Admin dashboard with priority sorting and investigation tools
- SLA definitions for different client tiers
This system will allow admins to:
- Quickly identify Reputation+ clients for priority handling
- Track anonymous users via IP addresses and session data
- Review complete history of any shipper's reviews
- Make informed decisions about blocking abusive users
- Maintain audit trails for compliance

---

## 10. FAQ & Platform Rules

### 10.1 Review Guidelines & Acceptable Behavior
**What are the rules for submitting reviews?**
- Reviews must be based on actual experience with the forwarder
- One review per branch per company every 90 days
- Reviews must be objective and factual
- No personal attacks, defamatory statements, or false information
- No reviews from competitors or employees of the forwarder

**What happens if I violate the platform rules?**
- **First violation**: Warning and review removal
- **Second violation**: Temporary suspension (30 days)
- **Third violation**: Permanent account ban
- **Severe violations**: Immediate permanent ban

**What constitutes a "severe violation"?**
- Submitting fake reviews for competitors
- Multiple reviews from same company/IP address
- Harassment or threats in review content
- Attempting to manipulate scores through coordinated reviews
- Providing false information about services received

### 10.2 Dispute & Moderation Process
**How do I dispute a review about my company?**
- Log into your Insights or Reputation+ account
- Navigate to the disputed review
- Click "Flag for Review" and provide reason
- Our moderation team will investigate within 5-7 days (24-48 hours for Reputation+ clients)

**What happens during a dispute investigation?**
- We review all reviews from the same shipper
- Check IP addresses and user patterns
- Verify the shipper's identity and relationship to your company
- Consider review content and platform guidelines
- Make a decision to uphold or remove the review

**Can I see who wrote an anonymous review?**
- Anonymous reviewer identities are protected
- We may reveal identity only if required by law
- Our investigation focuses on review validity, not reviewer identity

### 10.3 Account Management
**Can I edit or delete my review?**
- Reviews can be edited within 24 hours of submission
- After 24 hours, contact support for corrections
- Reviews cannot be deleted once published

**What if I'm banned from the platform?**
- You cannot submit new reviews
- Existing reviews remain visible (unless removed for violations)
- Company email domains may be blocked from future registrations
- Appeals can be submitted to support@logiscore.net

**How do I appeal a ban or review removal?**
- Email support@logiscore.net with your case
- Include relevant evidence and explanation
- Appeals are reviewed within 7-10 business days
- Final decisions are communicated via email

### 10.4 Data & Privacy
**How is my review data protected?**
- Anonymous reviews: No personal information shared
- Verified reviews: Company name only (unless you choose to remain anonymous)
- IP addresses: Used only for fraud detection and moderation
- Review content: Protected under our privacy policy

**Can forwarders see my personal information?**
- No personal contact details are shared
- Company names are shown for verified reviews only
- Anonymous reviews show no identifying information

---

## Appendix A: Full Question Set

### 1. Responsiveness
Q1.1 Acknowledges receipt of requests (for quotation or information) within 30 minutes (even if full response comes later)
Q1.2 Provides clear estimated response time if immediate resolution is not possible
Q1.3 Responds within 6 hours to rate requests to/from locations within the same region
Q1.4 Responds within 24 hours to rate requests to/from other regions (e.g. Asia to US, US to Europe)
Q1.5 Responds to emergency requests (e.g., urgent shipment delay, customs issues) within 30 minutes

**Possible answers (all questions):**
- 4 = 100% every time
- 3 = 75% most of the time
- 2 = 50% usually on time
- 1 = 25% hardly on time
- 0 = 0%/Never/Not provided

### 2. Shipment Management
Q2.1 Proactively sends shipment milestones (e.g., pickup, departure, arrival, delivery) without being asked
Q2.2 Sends pre-alerts before vessel ETA
Q2.3 Provides POD (proof of delivery) within 24 hours of delivery
Q2.4 Proactively notifies delays or disruptions
Q2.5 Offers recovery plans in case of delays or missed transshipments

**Possible answers:** Same as above

### 3. Documentation
Q3.1 Issues draft B/L or HAWB within 24 hours of cargo departure
Q3.2 Sends final invoices within 48 hours of shipment completion
Q3.3 Ensures documentation is accurate and complete on first submission (error rate < 2%)
Q3.4 Final invoice matches quotation (no hidden costs; all calculations and volumes are correct)

**Possible answers:**
- 4 = 100% on time/accurate every time
- 3 = 75% on time/accurate most of the time
- 2 = 50% usually on time/accurate
- 1 = 25% hardly on time/accurate
- 0 = 0%/Never/Not provided

### 4. Customer Experience
Q4.1 Follows up on pending issues without the need for reminders
Q4.2 Rectifies documentation (shipping documents and invoices/credit notes) within 48 hours
Q4.3 Provides named contact person(s) for operations and customer service
Q4.4 Offers single point of contact for issue escalation
Q4.5 Replies in professional tone, avoids jargon unless relevant

**Possible answers:** Same as above

### 5. Tech & Process
Q5.1 Offers track-and-trace (via portal or milestone emails)
Q5.2 Has an online document portal or can deliver documents in a single zipped file on request
Q5.3 Integrates with customer systems (e.g., EDI/API) where required
Q5.4 Provides regular reporting (e.g., weekly shipment report, KPI report)

**Possible answers:**
- 4 = 100%: Solution via web/mobile, always up-to-date, complete, dynamic tracking, document access, scheduled reports, no extra charge
- 3 = 75%: Solution via web or mobile, but not always up-to-date/current/complete, or no document access, no extra charge
- 2 = 50%: Some track-and-trace, web or mobile, static info, or service is charged
- 1 = 25%: Minimal/limited info, only on request, or significant delays
- 0 = 0%: No information online/not provided

### 6. Reliability & Execution
Q6.1 On-time pickup rate (%)
Q6.2 Shipped as promised (%)
Q6.3 On-time delivery rate (%)
Q6.4 Compliance with clients' SOP (%)
Q6.5 Customs clearance error rate (%)
Q6.6 Claims ratio (number of claims / total shipments)

**Possible answers (Q6.1–Q6.5):**
- 4 = 100% on time every time
- 3 = 75% on time most of the time
- 2 = 50% usually on time
- 1 = 25% hardly on time
- 0 = 0%/Never/Not provided

**Possible answers (Q6.6 Claims ratio):**
- 4 = Rarely claims (≥9 out of 10 shipments have no issues)
- 3 = Occasional claims (≤25% of shipments have issues)
- 2 = Regular claims (≈50% of shipments have issues)
- 1 = Claims often occur (≥70% of shipments have issues)
- 0 = Not provided

### 7. Proactivity & Insight
Q7.1 Offers rate trends and capacity forecasts for key trade lanes
Q7.2 Notifies customer of upcoming GRI or BAF changes in advance
Q7.3 Provides suggestions for consolidation, better routings, or mode shifts

**Possible answers:**
- 4 = Proactive updates about trends, carriers, customs, geopolitical issues, and mitigation options
- 3 = Updates when requested about trends, carriers, customs, geopolitical issues, and mitigation options
- 2 = Some information about trends, carriers, geopolitical issues when requested
- 1 = Not able to provide any information about trends, carriers, customs, or geopolitics
- 0 = Not provided

### 8. After-Hours Support (Optional)
Q8.1 Has 24/7 support or provides emergency contact for after-hours escalation
Q8.2 Weekend or holiday contact provided in advance for critical shipments

**Possible answers:**
- N/A = Service not required
- 4 = 24/7 helpdesk always available
- 3 = Helpdesk available, 1–2 hours to activate
- 2 = Helpdesk available, >2 hours to activate
- 1 = Helpdesk only during normal working hours
- 0 = Not provided

*All questions should be answered as objectively as possible. If a question is not applicable, select '0' or 'N/A' as appropriate.*

---

*Last updated: 2025-07-26* 