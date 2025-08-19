<script lang="ts">
  import { onMount } from 'svelte';
  
  // Set page title
  onMount(() => {
    document.title = 'Privacy Policy - LogiScore';
  });
</script>

<svelte:head>
  <title>Privacy Policy - LogiScore</title>
  <meta name="description" content="LogiScore Privacy Policy - How we collect, use, and protect your personal data in compliance with PDPA and GDPR regulations." />
</svelte:head>

<div class="privacy-container">
  <div class="header">
    <h1>🔒 LogiScore Privacy Policy</h1>
    <div class="meta">
      <span><strong>Effective Date:</strong> August 2025</span>
      <span><strong>Last Updated:</strong> August 2025</span>
    </div>
  </div>

  <div class="content">
    <section class="policy-section">
      <h2>1. Introduction</h2>
      <p>LogiScore is a shipper-only platform designed to increase transparency in freight forwarding. We take your privacy seriously and are committed to protecting your personal data in compliance with applicable laws, including Singapore's <strong>Personal Data Protection Act (PDPA)</strong> and, where applicable, the <strong>General Data Protection Regulation (GDPR)</strong>.</p>
    </section>

    <section class="policy-section">
      <h2>2. Information We Collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li><strong>Account Information:</strong> Business name, contact person, business email (corporate domains only), phone number.</li>
        <li><strong>Verification Information:</strong> Proof of shipment (e.g., AWB, Bill of Lading). Sensitive shipment details are anonymized and not shared with forwarders.</li>
        <li><strong>Usage Data:</strong> Login times, IP address, device type, and browsing behavior on the platform.</li>
        <li><strong>Ratings Data:</strong> Your submitted ratings across service categories.</li>
        <li><strong>Payment Data:</strong> Subscription billing is processed securely by <strong>Stripe</strong>. We do not collect or store credit card numbers, CVV codes, or full payment details. We only retain limited billing metadata such as subscription type, invoice references, and payment status.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To verify that you are a genuine shipper.</li>
        <li>To maintain account integrity (e.g., blocking free/personal email domains).</li>
        <li>To display aggregated ratings of freight forwarders.</li>
        <li>To detect and prevent fraudulent activity.</li>
        <li>To process subscriptions and billing through Stripe.</li>
        <li>To communicate with you regarding platform updates, policy changes, and service issues.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>4. Sharing of Information</h2>
      <p>We do not sell or rent your data. Information may be shared:</p>
      <ul>
        <li>With <strong>service providers</strong> (hosting, payment via Stripe, email delivery) under strict data protection agreements.</li>
        <li>In response to <strong>legal requests</strong> (court orders, regulatory authorities).</li>
        <li>As part of <strong>aggregated, anonymized reporting</strong> (e.g., score averages), which cannot identify individual shippers.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>5. Data Retention</h2>
      <ul>
        <li>Account data is retained while your subscription is active and up to 24 months after termination.</li>
        <li>Verification documents are stored securely for audit purposes and deleted after <strong>12 months</strong>.</li>
        <li><strong>Payment records</strong> (e.g., invoices and receipts) are retained for accounting and compliance purposes as required by law.</li>
        <li>LogiScore does not store sensitive payment data (credit card numbers, CVV codes); these are handled exclusively by <strong>Stripe</strong> in accordance with their <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</li>
        <li>Anonymized ratings remain in the system to ensure platform integrity.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>6. Security</h2>
      <ul>
        <li>Data is encrypted in transit and at rest.</li>
        <li>Access to verification documents is restricted to authorized staff only.</li>
        <li>Regular security audits are conducted.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>7. Your Rights</h2>
      <p>Depending on jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request corrections or deletion.</li>
        <li>Withdraw consent to data use (subject to impact on your ability to use the platform).</li>
        <li>File a complaint with a data protection authority.</li>
      </ul>
      <p>Requests can be sent to <strong><a href="mailto:privacy@logiscore.net">privacy@logiscore.net</a></strong>.</p>
    </section>

    <section class="policy-section">
      <h2>8. Cookies & Tracking</h2>
      <p>LogiScore uses cookies and analytics to improve user experience. You can manage or disable cookies in your browser settings, but some functions may not work properly.</p>
    </section>

    <section class="policy-section">
      <h2>9. Notice & Takedown Policy</h2>
      <p>Forwarder disputes are handled under our <a href="/notice-takedown">Notice & Takedown Policy</a>. This process may require review of rating data, but personal shipper details remain protected unless disclosure is legally required.</p>
    </section>

    <section class="policy-section">
      <h2>10. Data Protection Officer (DPO)</h2>
      <p>In compliance with Singapore PDPA and the EU GDPR, LogiScore has appointed a <strong>Data Protection Officer (DPO)</strong> to oversee our data protection strategy and compliance.</p>
      <p>You may contact our DPO for any concerns regarding the handling of your personal data, including access, correction, or deletion requests.</p>
      <div class="contact-info">
        <p>📧 <a href="mailto:dpo@logiscore.net">dpo@logiscore.net</a></p>
      </div>
    </section>

    <section class="policy-section">
      <h2>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. All changes will be posted on this page with a revised "Last Updated" date.</p>
    </section>

    <section class="policy-section">
      <h2>12. Contact Us</h2>
      <div class="contact-info">
        <p><strong>For general privacy-related inquiries:</strong></p>
        <p>📧 <a href="mailto:privacy@logiscore.net">privacy@logiscore.net</a></p>
        <p>📧 <a href="mailto:legal@logiscore.net">legal@logiscore.net</a></p>
        
        <p><strong>For Data Protection Officer inquiries:</strong></p>
        <p>📧 <a href="mailto:dpo@logiscore.net">dpo@logiscore.net</a></p>
      </div>
    </section>
  </div>

  <div class="footer-actions">
    <a href="/guidelines" class="btn btn-secondary">Community Guidelines</a>
    <a href="/contact" class="btn btn-primary">Contact Support</a>
  </div>
</div>

<style>
  .privacy-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    line-height: 1.6;
  }

  .header {
    text-align: center;
    margin-bottom: 50px;
    padding-bottom: 30px;
    border-bottom: 2px solid #ffd700;
  }

  .header h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 20px;
  }

  .meta {
    display: flex;
    justify-content: center;
    gap: 30px;
    font-size: 0.9rem;
    color: #888;
  }

  .policy-section {
    margin-bottom: 40px;
    padding: 25px;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #ffd700;
  }

  .policy-section h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }

  .policy-section ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  .policy-section li {
    margin-bottom: 8px;
  }

  .policy-section strong {
    color: #333;
  }

  .contact-info {
    background: #e8f4fd;
    border: 1px solid #bee5eb;
    border-radius: 6px;
    padding: 15px;
    margin: 15px 0;
  }

  .contact-info p {
    margin: 8px 0;
  }

  .footer-actions {
    text-align: center;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid #eee;
  }

  .btn {
    display: inline-block;
    padding: 12px 24px;
    margin: 0 10px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: #ffd700;
    color: #333;
  }

  .btn-primary:hover {
    background: #ffed4e;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
  }

  .btn-secondary:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  a {
    color: #007bff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .privacy-container {
      padding: 20px 15px;
    }

    .header h1 {
      font-size: 2rem;
    }

    .meta {
      flex-direction: column;
      gap: 10px;
    }

    .policy-section {
      padding: 20px;
    }

    .footer-actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .btn {
      margin: 0;
    }
  }
</style>
