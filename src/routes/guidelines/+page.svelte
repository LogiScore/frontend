<script lang="ts">
  import { onMount } from 'svelte';
  
  // Set page title
  onMount(() => {
    document.title = 'Community Guidelines - LogiScore';
  });
</script>

<svelte:head>
  <title>Community Guidelines - LogiScore</title>
  <meta name="description" content="LogiScore Community Guidelines - Rules and standards for our shipper-only platform where importers, exporters, and BCOs can share structured ratings of freight forwarders." />
</svelte:head>

<div class="guidelines-container">
  <div class="header">
    <h1>📘 LogiScore Community Guidelines</h1>
    <p class="subtitle">Building a transparent, trusted community for shippers</p>
    <div class="meta">
      <span><strong>Effective Date:</strong> August 2025</span>
      <span><strong>Last Updated:</strong> August 2025</span>
    </div>
  </div>

  <div class="content">
    <section class="guideline-section">
      <h2>1. Purpose</h2>
      <p>LogiScore is a <strong>shipper-only platform</strong> where importers, exporters, and BCOs can share <strong>structured ratings</strong> of freight forwarders. Our goal is to build a transparent, trusted community where shippers can make informed decisions based on genuine experiences.</p>
    </section>

    <section class="guideline-section">
      <h2>2. What Reviews Consist Of</h2>
      <ul>
        <li>Ratings are given on a <strong>1–5 scale</strong> across fixed categories such as:
          <ul>
            <li>Responsiveness</li>
            <li>Documentation Accuracy</li>
            <li>Reliability</li>
            <li>Customer Service</li>
            <li>Value for Money</li>
            <li>Proactivity</li>
            <li>Technology & Visibility</li>
            <li>After Hours Support</li>
          </ul>
        </li>
        <li>Reviews are <strong>numerical only</strong>. Free-text comments are not permitted.</li>
        <li>Each rating represents a <strong>shipper's personal opinion and experience</strong>, not a factual claim about the forwarder.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>3. Verification of Reviews</h2>
      <ul>
        <li>To ensure authenticity, shippers may be required to provide <strong>proof of shipment</strong> (e.g., AWB, Bill of Lading, or equivalent).</li>
        <li>Verification is required <strong>once per forwarder per subscription period</strong>.</li>
        <li>Sensitive data (cargo details, consignee names, rates) is stripped and not shared with forwarders.</li>
        <li>Verified shippers receive a <strong>"Verified Shipper" badge</strong>.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>4. Review Frequency & Limits</h2>
      <ul>
        <li>Shippers may submit <strong>one review per forwarder branch every six months</strong>.</li>
        <li>Ratings must reflect services actually used within the past <strong>6 months</strong>.</li>
        <li>Multiple reviews from the same company for the same branch in the same six month period may be removed.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>5. Account Registration Rules</h2>
      <p>To maintain platform integrity:</p>
      <ul>
        <li>Users must register with a corporate or business email address.</li>
        <li>Registrations using personal or free email providers are prohibited.</li>
        <li>Accounts created with such addresses may be blocked or removed.</li>
      </ul>
      
      <div class="email-warning">
        <h3>Examples of prohibited email providers (non-exhaustive list):</h3>
        <div class="email-grid">
          <div class="email-column">
            <p>126.com → NetEase Mail</p>
            <p>139.com → China Mobile Mail</p>
            <p>163.com → NetEase Mail</p>
            <p>189.cn → China Telecom Mail</p>
            <p>21cn.com</p>
            <p>aliyun.com / aliyun.cn → Alibaba Cloud Mail</p>
            <p>arcor.de → Vodafone</p>
            <p>emailn.de</p>
            <p>eyou.com → Netease Mail</p>
            <p>freenet.de</p>
            <p>gmail.com</p>
            <p>gmx.com</p>
            <p>gmx.de → 1&1 Mail & Media</p>
            <p>gmx.net</p>
            <p>hotmail.com</p>
            <p>icloud.com</p>
            <p>live.com</p>
            <p>mail.com</p>
            <p>mail.de</p>
            <p>online.de</p>
            <p>outlook.com</p>
            <p>protonmail.com</p>
            <p>qq.com → Tencent QQ Mail</p>
            <p>sina.com / sina.cn → Sina Mail</p>
            <p>sohu.com → Sohu Mail</p>
            <p>t-online.de → Deutsche Telekom</p>
            <p>tom.com → TOM Mail</p>
            <p>web.de → 1&1 Mail & Media</p>
            <p>wo.cn / wo.com.cn → China Unicom Mail</p>
            <p>yahoo.com</p>
            <p>yandex.com</p>
            <p>yeah.net → NetEase free email service</p>
            <p>zoho.com</p>
          </div>
        </div>
        <p class="note">👉 Additional free/private domains may be added to the blocklist as detected.</p>
      </div>
    </section>

    <section class="guideline-section">
      <h2>6. Anonymity & Identity Options</h2>
      <ul>
        <li>Shippers may post reviews <strong>anonymously</strong>.</li>
        <li>Reviewer identities will <strong>never be revealed</strong> to forwarders except when legally required.</li>
        <li>Verified company names may be displayed <strong>only if the shipper chooses</strong>.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>7. Prohibited Behavior</h2>
      <p>The following are not allowed on LogiScore:</p>
      <ul>
        <li>Submitting ratings without a genuine shipment relationship.</li>
        <li>Submitting ratings on behalf of competitors or employees of a forwarder.</li>
        <li>Creating multiple accounts to manipulate scores.</li>
        <li>Attempting to pressure or threaten other shippers to change their ratings.</li>
        <li>Submitting fraudulent shipment documents for verification.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>8. Dispute Process (Forwarders)</h2>
      <ul>
        <li>Forwarders cannot edit or remove ratings directly.</li>
        <li>They may submit a formal complaint under our <a href="/notice-takedown">Notice & Takedown Policy</a>.</li>
        <li>Disputes are reviewed by LogiScore's moderation team within 7 business days.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>9. Enforcement</h2>
      <ul>
        <li><strong>First violation:</strong> Warning + review removal.</li>
        <li><strong>Second violation:</strong> 30-day suspension of account.</li>
        <li><strong>Third violation:</strong> Permanent ban from the platform.</li>
        <li><strong>Severe violations (e.g., fake reviews, fraud, harassment):</strong> Immediate permanent ban.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>10. Transparency & Accountability</h2>
      <ul>
        <li>LogiScore publishes a <strong>quarterly Transparency Report</strong> with statistics on takedown requests, removals, and appeals.</li>
        <li>This ensures our moderation process is clear and accountable.</li>
      </ul>
    </section>

    <section class="guideline-section">
      <h2>11. Final Note</h2>
      <p>These guidelines are designed to protect both shippers and forwarders. By keeping reviews <strong>structured, verified, and opinion-based</strong>, we aim to create a platform that is <strong>fair, credible, and legally resilient</strong>.</p>
    </section>
  </div>

  <div class="footer-actions">
            <a href="/faq" class="btn btn-secondary">Need Help?</a>
    <a href="/contact" class="btn btn-primary">Contact Support</a>
  </div>
</div>

<style>
  .guidelines-container {
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

  .meta {
    display: flex;
    justify-content: center;
    gap: 30px;
    font-size: 0.9rem;
    color: #888;
  }

  .guideline-section {
    margin-bottom: 40px;
    padding: 25px;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #ffd700;
  }

  .guideline-section h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }

  .guideline-section h3 {
    color: #555;
    margin: 20px 0 10px 0;
    font-size: 1.1rem;
  }

  .guideline-section ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  .guideline-section li {
    margin-bottom: 8px;
  }

  .guideline-section ul ul {
    margin: 10px 0;
  }

  .guideline-section strong {
    color: #333;
  }

  .email-warning {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 20px;
    margin: 20px 0;
  }

  .email-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
    margin: 15px 0;
  }

  .email-column p {
    margin: 3px 0;
    font-size: 0.9rem;
    color: #666;
  }

  .note {
    font-style: italic;
    color: #666;
    margin-top: 15px;
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
    .guidelines-container {
      padding: 20px 15px;
    }

    .header h1 {
      font-size: 2rem;
    }

    .meta {
      flex-direction: column;
      gap: 10px;
    }

    .guideline-section {
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
