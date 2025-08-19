<script lang="ts">
  import { onMount } from 'svelte';
  
  // Set page title
  onMount(() => {
    document.title = 'Legal FAQ - LogiScore';
  });
</script>

<svelte:head>
  <title>Legal FAQ - LogiScore</title>
  <meta name="description" content="LogiScore Legal FAQ - Answers to common legal questions about our platform, liability, and dispute resolution processes." />
</svelte:head>

<div class="legal-container">
  <div class="header">
    <h1>⚖️ LogiScore Legal FAQ</h1>
    <p class="subtitle">Common legal questions about our platform</p>
  </div>

  <div class="content">
    <section class="faq-section">
      <h2>1. Who is responsible for the reviews?</h2>
      <p>All ratings on LogiScore are submitted by <strong>shippers only</strong>. Each review reflects the <strong>personal opinion and experience</strong> of the shipper, not a factual statement by LogiScore.</p>
    </section>

    <section class="faq-section">
      <h2>2. Are reviews anonymous?</h2>
      <p>Yes. Shippers may post ratings anonymously. Reviewer identities will never be disclosed to forwarders unless disclosure is legally required.</p>
    </section>

    <section class="faq-section">
      <h2>3. How does LogiScore verify reviews?</h2>
      <ul>
        <li>Shippers may be required to provide <strong>proof of shipment</strong> (e.g., AWB, Bill of Lading).</li>
        <li>Verification is required <strong>once per forwarder per subscription period</strong>.</li>
        <li>Sensitive data is anonymized and never shared with forwarders.</li>
        <li>Verified shippers receive a <strong>"Verified Shipper" badge</strong>.</li>
      </ul>
    </section>

    <section class="faq-section">
      <h2>4. Can forwarders remove reviews?</h2>
      <p>No. Forwarders cannot directly edit or delete ratings.</p>
      <p>They may file a formal request under our <a href="/notice-takedown">Notice & Takedown Policy</a>.</p>
      <p>Our moderation team reviews requests within <strong>7 business days</strong>.</p>
    </section>

    <section class="faq-section">
      <h2>5. What happens if a review is false or abusive?</h2>
      <ul>
        <li>Reviews are <strong>structured 1–5 ratings only</strong> (no free-text).</li>
        <li>This minimizes the risk of defamatory content.</li>
        <li>If a review is found to be fraudulent (e.g., no genuine shipment, competitor abuse), it will be removed, and the user may be banned.</li>
      </ul>
    </section>

    <section class="faq-section">
      <h2>6. What email addresses can be used to register?</h2>
      <p>To reduce fake or competitor accounts:</p>
      <ul>
        <li>Users must register with a <strong>corporate or business email</strong>.</li>
        <li>Free/personal domains (e.g., gmail.com, yahoo.com, qq.com, web.de) are blocked.</li>
        <li>Exceptions may be granted through admin review for legitimate SMEs.</li>
      </ul>
    </section>

    <section class="faq-section">
      <h2>7. Is LogiScore liable for reviews?</h2>
      <p>No. LogiScore acts as a <strong>neutral host of user-generated ratings</strong>.</p>
      <ul>
        <li>Reviews are treated as <strong>opinions</strong>, not factual claims.</li>
        <li>Users are legally responsible for their own submissions.</li>
        <li>Where applicable (e.g., U.S. operations), LogiScore relies on <strong>safe harbor protections</strong> such as Section 230 of the Communications Decency Act.</li>
      </ul>
    </section>

    <section class="faq-section">
      <h2>8. What happens if a forwarder sues LogiScore?</h2>
      <ul>
        <li>Ratings are opinion-based and structured (not text narratives), which makes defamation claims harder to pursue.</li>
        <li>Legal disputes are handled under our Terms of Service, which reference our <strong>Notice & Takedown Policy</strong> as the official dispute path.</li>
        <li>LogiScore also publishes a <strong>Transparency Report</strong> each quarter to demonstrate accountability.</li>
      </ul>
    </section>

    <section class="faq-section">
      <h2>9. Where is LogiScore legally based?</h2>
      <ul>
        <li>Currently: Singapore.</li>
        <li>In future, LogiScore may adopt a <strong>Delaware parent company + Singapore subsidiary</strong> structure for stronger safe harbor protections.</li>
      </ul>
    </section>

    <section class="faq-section">
      <h2>10. How can shippers or forwarders contact LogiScore about legal issues?</h2>
      <div class="contact-info">
        <p><strong>Disputes:</strong> <a href="mailto:disputes@logiscore.net">disputes@logiscore.net</a></p>
        <p><strong>Appeals:</strong> <a href="mailto:appeals@logiscore.net">appeals@logiscore.net</a></p>
        <p><strong>Legal inquiries:</strong> <a href="mailto:legal@logiscore.net">legal@logiscore.net</a></p>
      </div>
    </section>
  </div>

  <div class="footer-actions">
    <a href="/guidelines" class="btn btn-secondary">Community Guidelines</a>
    <a href="/privacy" class="btn btn-secondary">Privacy Policy</a>
    <a href="/contact" class="btn btn-primary">Contact Support</a>
  </div>
</div>

<style>
  .legal-container {
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
    margin-bottom: 15px;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 20px;
  }

  .faq-section {
    margin-bottom: 40px;
    padding: 25px;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #ffd700;
  }

  .faq-section h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }

  .faq-section ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  .faq-section li {
    margin-bottom: 8px;
  }

  .faq-section strong {
    color: #333;
  }

  .faq-section p {
    margin-bottom: 10px;
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
    .legal-container {
      padding: 20px 15px;
    }

    .header h1 {
      font-size: 2rem;
    }

    .faq-section {
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
