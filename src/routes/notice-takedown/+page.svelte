<script lang="ts">
  import { onMount } from 'svelte';
  
  // Set page title
  onMount(() => {
    document.title = 'Notice & Takedown Policy - LogiScore';
  });
</script>

<svelte:head>
  <title>Notice & Takedown Policy - LogiScore</title>
  <meta name="description" content="LogiScore Notice & Takedown Policy - How we handle requests to remove or edit user-generated content while maintaining platform neutrality." />
</svelte:head>

<div class="policy-container">
  <div class="header">
    <h1>📜 LogiScore Notice & Takedown Policy</h1>
    <div class="meta">
      <span><strong>Effective Date:</strong> August 2025</span>
      <span><strong>Last Updated:</strong> August 2025</span>
    </div>
  </div>

  <div class="content">
    <section class="policy-section">
      <h2>1. Purpose</h2>
      <p>This policy explains how LogiScore handles requests to remove or edit user-generated content ("Reviews" or "Ratings"). We aim to balance:</p>
      <ul>
        <li>The right of shippers to share honest experiences.</li>
        <li>The right of freight forwarders to protect their reputation from false or abusive content.</li>
        <li>Our role as a <strong>neutral platform</strong> and not the author of reviews.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>2. What Content Can Be Reported</h2>
      <p>A freight forwarder, shipper, or third party may submit a takedown request if a review:</p>
      <ul>
        <li>Violates our <a href="/guidelines">Review Guidelines</a> (e.g., fake, abusive, defamatory).</li>
        <li>Is <strong>not based on a genuine shipping transaction</strong>.</li>
        <li>Contains <strong>confidential or personal information</strong> (names of individuals, contract details, rates).</li>
        <li>Is <strong>manipulative or fraudulent</strong> (e.g., competitor sabotage, multiple accounts).</li>
        <li>Is otherwise <strong>unlawful under applicable laws</strong>.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>3. How to Submit a Notice</h2>
      <p>To request removal of a review, the complainant must:</p>
      <ol>
        <li>Contact us via the <strong><a href="/contact">Contact</a></strong> page with subject line: <em>Notice & Takedown Request</em>.</li>
        <li>Provide the following information:
          <ul>
            <li>Identification of the specific review (forwarder name, branch, date).</li>
            <li>Explanation of why the content should be removed.</li>
            <li>Supporting evidence (if applicable).</li>
            <li>Contact information of the complainant.</li>
          </ul>
        </li>
        <li>Submit a <strong>good faith declaration</strong>: <em>"I have a good faith belief that the content identified is unlawful, inaccurate, or violates LogiScore's policies."</em></li>
        <li>Acknowledge that misuse of the process may result in suspension from the platform.</li>
      </ol>
    </section>

    <section class="policy-section">
      <h2>4. Review Process</h2>
      <ul>
        <li><strong>Acknowledgement:</strong> We confirm receipt within <strong>48 hours</strong>.</li>
        <li><strong>Investigation:</strong> Our moderation team reviews the request against platform rules within <strong>7 business days</strong>.</li>
        <li><strong>Outcome:</strong>
          <ul>
            <li>If the review clearly violates guidelines → it is removed or edited (with explanation logged).</li>
            <li>If the review complies → it remains online, and the complainant is notified.</li>
          </ul>
        </li>
        <li><strong>Transparency:</strong> All removal decisions are logged for our quarterly <strong>Transparency Report</strong>.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>5. Reviewer Notification</h2>
      <ul>
        <li>If a review is removed or edited, the <strong>reviewer is notified</strong> with the reason.</li>
        <li>Reviewers may appeal within <strong>7 business days</strong> via our <strong><a href="/contact">Contact</a></strong> page.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>6. No Guaranteed Removal</h2>
      <ul>
        <li>A Notice & Takedown request does <strong>not guarantee removal</strong>.</li>
        <li>Reviews that reflect <strong>subjective shipper opinions</strong> (e.g., star ratings, structured feedback) but do not breach our guidelines will remain published.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>7. Legal Requests</h2>
      <ul>
        <li>If a valid <strong>court order or legal directive</strong> requires us to remove content, we will comply.</li>
        <li>Unless legally restricted, we will notify the reviewer of such removal.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>8. Abuse of Policy</h2>
      <ul>
        <li>Submitting fraudulent or excessive takedown requests may result in suspension of access.</li>
        <li>Forwarders or shippers attempting to manipulate ratings via N&T requests risk permanent ban.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>9. Transparency</h2>
      <p>LogiScore publishes a <strong>quarterly Transparency Report</strong> summarizing:</p>
      <ul>
        <li>Number of takedown requests received.</li>
        <li>Number approved vs. rejected.</li>
        <li>Categories of violations.</li>
      </ul>
    </section>
  </div>

  <div class="footer-actions">
    <a href="/legal" class="btn btn-secondary">Legal FAQ</a>
    <a href="/guidelines" class="btn btn-secondary">Community Guidelines</a>
    <a href="/contact" class="btn btn-primary">Contact Support</a>
  </div>
</div>

<style>
  .policy-container {
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

  .policy-section.highlight {
    background: #e8f5e8;
    border-left-color: #28a745;
  }

  .policy-section h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }

  .policy-section ul, .policy-section ol {
    margin: 15px 0;
    padding-left: 20px;
  }

  .policy-section li {
    margin-bottom: 8px;
  }

  .policy-section ul ul {
    margin: 10px 0;
  }

  .policy-section strong {
    color: #333;
  }

  .policy-section em {
    font-style: italic;
    color: #666;
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
    .policy-container {
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
