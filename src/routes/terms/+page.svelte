<script lang="ts">
  import { onMount } from 'svelte';
  
  // Set page title
  onMount(() => {
    document.title = 'Terms of Service - LogiScore';
  });
</script>

<svelte:head>
  <title>Terms of Service - LogiScore</title>
  <meta name="description" content="LogiScore Terms of Service - Complete terms and conditions for using our freight forwarder review platform." />
</svelte:head>

<div class="tos-container">
  <div class="header">
    <h1>📜 LogiScore Terms of Service (TOS)</h1>
    <div class="meta">
      <span><strong>Effective Date:</strong> August 2025</span>
      <span><strong>Last Updated:</strong> August 2025</span>
    </div>
  </div>

  <div class="content">
    <section class="tos-section">
      <h2>1. Introduction</h2>
      <p>Welcome to LogiScore ("we," "our," "us"). LogiScore is a platform where shippers, importers, and exporters ("Users" or "Shippers") can share structured ratings of freight forwarders.</p>
      <p>By using LogiScore, you agree to these Terms of Service ("TOS"), our <a href="/guidelines">Review Guidelines</a>, our <a href="/privacy">Privacy Policy</a>, and our <a href="/notice-takedown">Notice & Takedown Policy (NTP)</a>, which are incorporated by reference.</p>
      <p>If you do not agree, you must not use our platform.</p>
    </section>

    <section class="tos-section">
      <h2>2. Platform Role & Limitations</h2>
      <ul>
        <li>LogiScore is a <strong>neutral host</strong> of user-generated content.</li>
        <li>We do <strong>not endorse</strong> or guarantee the quality of any freight forwarder or service reviewed.</li>
        <li>Ratings represent <strong>personal opinions and experiences</strong> only, not verified facts.</li>
        <li>We do not conduct independent audits of forwarder services.</li>
      </ul>
    </section>

    <section class="tos-section">
      <h2>3. User Responsibilities</h2>
      <p>When using LogiScore, you agree to:</p>
      <ul>
        <li>Submit ratings only if based on <strong>genuine service experiences</strong> within the past 6 months.</li>
        <li>Provide accurate forwarder/branch details.</li>
        <li>Follow our <a href="/guidelines">Review Guidelines</a>.</li>
      </ul>
      <p>You must not:</p>
      <ul>
        <li>Submit ratings if you are a <strong>competitor or employee</strong> of the forwarder.</li>
        <li>Create multiple accounts to manipulate scores.</li>
        <li>Attempt to remove, suppress, or manipulate ratings outside the <a href="/notice-takedown">Notice & Takedown Policy</a>.</li>
      </ul>
      
      <h3>Reviewer Anonymity & Disclosure</h3>
      <h4>Reviewer Anonymity</h4>
      <p>LogiScore allows shippers to submit reviews anonymously. Forwarders and other third parties will not see the reviewer's identity. LogiScore verifies that all reviews come from genuine shippers, but the identity of individual reviewers remains strictly confidential.</p>
      
      <h4>Disclosure of Identities</h4>
      <p>LogiScore will never voluntarily disclose a reviewer's identity to a forwarder or third party. Reviewer information may only be disclosed if LogiScore is legally required to do so under a valid court order or applicable law from a court of competent jurisdiction.</p>
      
      <h4>Limitation of Liability</h4>
      <p>By submitting a review, you acknowledge that while LogiScore takes all reasonable steps to preserve anonymity, absolute confidentiality cannot be guaranteed if compelled by law.</p>
    </section>

    <section class="tos-section">
      <h2>4. Verification of Ratings</h2>
      <ul>
        <li>Users may be required to provide proof of shipment (e.g., AWB, Bill of Lading).</li>
        <li>Verification may apply <strong>once per forwarder per subscription period</strong>.</li>
        <li>Identifying details are anonymized; documents are not shared with forwarders.</li>
        <li>Verified users receive a "Verified Shipper" badge.</li>
      </ul>
    </section>

    <section class="tos-section">
      <h2>5. Anonymity & Privacy</h2>
      <ul>
        <li>Users may post ratings anonymously.</li>
        <li>Reviewer identities will not be disclosed unless required by law.</li>
        <li>Data is handled according to our <a href="/privacy">Privacy Policy</a>.</li>
      </ul>
    </section>

    <section class="tos-section">
      <h2>6. Notice & Takedown (NTP)</h2>
      <ul>
        <li>LogiScore provides a formal process for disputing content.</li>
        <li>Forwarders or third parties may submit removal requests through our <a href="/notice-takedown">Notice & Takedown Policy</a>.</li>
        <li>The NTP forms part of these Terms. By using LogiScore, you agree to be bound by its provisions.</li>
      </ul>
    </section>

    <section class="tos-section">
      <h2>7. Moderation & Removal</h2>
      <p>We reserve the right to remove or redact content that:</p>
      <ul>
        <li>Violates our <a href="/guidelines">Review Guidelines</a>.</li>
        <li>Is abusive, unlawful, or clearly not based on a genuine shipment.</li>
        <li>Contains confidential information (e.g., contract terms, pricing).</li>
      </ul>
      <p>Decisions are made according to the NTP.</p>
    </section>

    <section class="tos-section">
      <h2>8. Liability & Legal Protections</h2>
      <ul>
        <li>LogiScore is <strong>not liable</strong> for user-generated content.</li>
        <li>Ratings are legally considered <strong>opinions</strong>, not statements of fact.</li>
        <li>Users are responsible for the content they submit.</li>
        <li>Where applicable (e.g., U.S. operations), LogiScore relies on <strong>safe harbor protections</strong> such as Section 230 of the Communications Decency Act.</li>
      </ul>
    </section>

    <section class="tos-section">
      <h2>9. Governing Law & Dispute Resolution</h2>
      <ul>
        <li>These Terms are governed by the laws of Singapore.</li>
        <li>Any disputes shall be resolved through <strong>binding arbitration</strong>, unless otherwise required by law.</li>
      </ul>
    </section>

    <section class="tos-section">
      <h2>10. Updates</h2>
      <p>We may update these Terms periodically. Continued use of LogiScore after updates constitutes acceptance of the revised Terms.</p>
    </section>
  </div>

  <div class="footer-actions">
    <a href="/guidelines" class="btn btn-secondary">Community Guidelines</a>
    <a href="/privacy" class="btn btn-secondary">Privacy Policy</a>
    <a href="/legal" class="btn btn-secondary">Legal FAQ</a>
    <a href="/contact" class="btn btn-primary">Contact Support</a>
  </div>
</div>

<style>
  .tos-container {
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

  .tos-section {
    margin-bottom: 40px;
    padding: 25px;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #ffd700;
  }

  .tos-section h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }

  .tos-section h3 {
    color: #444;
    margin: 25px 0 15px 0;
    font-size: 1.2rem;
  }

  .tos-section h4 {
    color: #555;
    margin: 20px 0 10px 0;
    font-size: 1.1rem;
  }

  .tos-section ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  .tos-section li {
    margin-bottom: 8px;
  }

  .tos-section strong {
    color: #333;
  }

  .tos-section p {
    margin-bottom: 10px;
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
    .tos-container {
      padding: 20px 15px;
    }

    .header h1 {
      font-size: 2rem;
    }

    .meta {
      flex-direction: column;
      gap: 10px;
    }

    .tos-section {
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

