<script lang="ts">
  // Transparency Report page
</script>

<svelte:head>
  <title>Transparency Report - LogiScore</title>
  <meta name="description" content="LogiScore's transparency report covering our policies, practices, and commitment to openness in logistics review services." />
</svelte:head>

<div class="transparency-report">
  <div class="container">
    <div class="header">
      <h1>📊 LogiScore Transparency Report</h1>
      <div class="meta">
        <span><strong>Effective Date:</strong> January 2025</span>
        <span><strong>Last Updated:</strong> January 2025</span>
      </div>
    </div>

    <div class="content">
      <section class="report-section">
        <h2>Executive Summary</h2>
        <p>LogiScore is committed to transparency in our operations, policies, and decision-making processes. This report provides insight into how we maintain the integrity of our platform and serve our community of users, freight forwarders, and logistics professionals.</p>
      </section>

      <section class="report-section">
        <h2>Platform Governance</h2>
        <div class="governance-item">
          <h3>Review Moderation</h3>
          <p>We employ a multi-layered approach to review moderation:</p>
          <ul>
            <li><strong>Automated Screening:</strong> AI-powered detection of potentially fraudulent or inappropriate content</li>
            <li><strong>Human Review:</strong> Expert moderators review flagged content and edge cases</li>
            <li><strong>Community Reporting:</strong> Users can report suspicious reviews for investigation</li>
            <li><strong>Regular Audits:</strong> Monthly reviews of moderation decisions and policies</li>
          </ul>
        </div>

        <div class="governance-item">
          <h3>Content Standards</h3>
          <p>Our content policies ensure reviews are:</p>
          <ul>
            <li>Based on genuine customer experiences</li>
            <li>Free from harassment or discriminatory language</li>
            <li>Accurate and relevant to logistics services</li>
            <li>Compliant with applicable laws and regulations</li>
          </ul>
        </div>
      </section>

      <section class="report-section">
        <h2>Data & Privacy</h2>
        <div class="data-item">
          <h3>Data Collection</h3>
          <p>We collect only the data necessary to provide our services:</p>
          <ul>
            <li>User account information for authentication</li>
            <li>Review content and ratings</li>
            <li>Usage analytics to improve platform functionality</li>
            <li>Communication records for customer support</li>
          </ul>
        </div>

        <div class="data-item">
          <h3>Data Protection</h3>
          <p>Your data is protected through:</p>
          <ul>
            <li>End-to-end encryption for sensitive communications</li>
            <li>Regular security audits and penetration testing</li>
            <li>Compliance with GDPR and other privacy regulations</li>
            <li>Limited access controls for staff members</li>
          </ul>
        </div>
      </section>

      <section class="report-section">
        <h2>Review Integrity</h2>
        <div class="integrity-item">
          <h3>Verification Process</h3>
          <p>We verify reviews through multiple methods:</p>
          <ul>
            <li>Email verification for new user accounts</li>
            <li>Transaction verification when possible</li>
            <li>Pattern analysis to detect suspicious activity</li>
            <li>Cross-referencing with shipping documentation</li>
          </ul>
        </div>

        <div class="integrity-item">
          <h3>Fraud Prevention</h3>
          <p>Our anti-fraud measures include:</p>
          <ul>
            <li>IP address monitoring for unusual patterns</li>
            <li>Device fingerprinting to detect multiple accounts</li>
            <li>Review velocity analysis</li>
            <li>Partnership with logistics industry databases</li>
          </ul>
        </div>
      </section>

      <section class="report-section">
        <h2>Platform Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <h3>Total Reviews</h3>
            <p class="stat-number">10,000+</p>
            <p class="stat-description">Verified customer reviews</p>
          </div>
          <div class="stat-item">
            <h3>Companies Listed</h3>
            <p class="stat-number">500+</p>
            <p class="stat-description">Freight forwarders and logistics providers</p>
          </div>
          <div class="stat-item">
            <h3>Review Removal Rate</h3>
            <p class="stat-number">&lt;2%</p>
            <p class="stat-description">Of reviews removed for policy violations</p>
          </div>
          <div class="stat-item">
            <h3>Response Rate</h3>
            <p class="stat-number">85%</p>
            <p class="stat-description">Of companies respond to reviews</p>
          </div>
        </div>
      </section>

      <section class="report-section">
        <h2>Future Commitments</h2>
        <p>We commit to:</p>
        <ul>
          <li>Publishing quarterly transparency reports</li>
          <li>Regular stakeholder consultations</li>
          <li>Continuous improvement of our verification processes</li>
          <li>Enhanced reporting on platform metrics</li>
          <li>Regular third-party audits of our systems</li>
        </ul>
      </section>

      <section class="report-section">
        <h2>Contact & Feedback</h2>
        <p>We welcome your feedback on this transparency report and our platform policies. For questions or concerns, please contact us:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> transparency@logiscore.com</p>
          <p><strong>Support:</strong> <a href="/contact">Contact Form</a></p>
          <p><strong>Legal:</strong> <a href="/legal">Legal FAQ</a></p>
        </div>
      </section>
    </div>
  </div>
</div>

<style>
  .transparency-report {
    padding: 40px 0;
    background: #f8f9fa;
    min-height: 100vh;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 60px;
    padding: 40px 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .header h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .meta {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
    margin-top: 20px;
  }

  .meta span {
    color: #666;
    font-size: 0.9rem;
  }

  .content {
    background: white;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .report-section {
    margin-bottom: 50px;
  }

  .report-section:last-child {
    margin-bottom: 0;
  }

  .report-section h2 {
    color: #333;
    font-size: 1.8rem;
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 3px solid #ffd700;
    font-weight: 600;
  }

  .governance-item,
  .data-item,
  .integrity-item {
    margin-bottom: 30px;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #ffd700;
  }

  .governance-item h3,
  .data-item h3,
  .integrity-item h3 {
    color: #444;
    font-size: 1.3rem;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .governance-item ul,
  .data-item ul,
  .integrity-item ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  .governance-item li,
  .data-item li,
  .integrity-item li {
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 25px;
    margin: 30px 0;
  }

  .stat-item {
    text-align: center;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px solid #e9ecef;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffd700;
    margin: 15px 0 10px 0;
  }

  .stat-description {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .contact-info {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 6px;
    margin-top: 20px;
  }

  .contact-info p {
    margin-bottom: 10px;
  }

  .contact-info a {
    color: #007bff;
    text-decoration: none;
  }

  .contact-info a:hover {
    text-decoration: underline;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header h1 {
      font-size: 2rem;
    }

    .content {
      padding: 25px 20px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .governance-item,
    .data-item,
    .integrity-item {
      padding: 20px;
    }
  }
</style>
