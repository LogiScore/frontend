<script lang="ts">
  import { onMount } from 'svelte';
  
  // Set page title
  onMount(() => {
    document.title = 'Cookie Policy - LogiScore';
  });
</script>

<svelte:head>
  <title>Cookie Policy - LogiScore</title>
  <meta name="description" content="LogiScore Cookie Policy - How we use cookies and similar technologies to improve your platform experience." />
</svelte:head>

<div class="cookie-container">
  <div class="header">
    <h1>🍪 LogiScore Cookie Policy</h1>
    <div class="meta">
      <span><strong>Effective Date:</strong> August 2025</span>
      <span><strong>Last Updated:</strong> August 2025</span>
    </div>
  </div>

  <div class="content">
    <section class="policy-section">
      <h2>1. Introduction</h2>
      <p>LogiScore uses cookies and similar technologies to ensure the platform functions properly, improve your experience, analyze usage, and deliver relevant content. This Cookie Policy explains what cookies are, which types we use, and how you can manage your preferences.</p>
    </section>

    <section class="policy-section">
      <h2>2. What Are Cookies?</h2>
      <p>Cookies are small text files stored on your device by your browser. They allow us to recognize your device, maintain secure sessions, and remember your preferences.</p>
    </section>

    <section class="policy-section">
      <h2>3. Types of Cookies We Use</h2>
      
      <h3>(a) Strictly Necessary Cookies</h3>
      <p>These cookies are essential for the operation of LogiScore. They enable functions such as:</p>
      <ul>
        <li>Logging in and managing your account.</li>
        <li>Processing secure transactions.</li>
        <li>Maintaining system security and fraud prevention.</li>
      </ul>
      <p>These cookies cannot be disabled in our systems.</p>
      
      <h3>(b) Functional Cookies</h3>
      <p>These cookies enhance your experience by remembering your preferences. Examples:</p>
      <ul>
        <li>Remembering language or region settings.</li>
        <li>Saving your login session between visits.</li>
      </ul>
      <p>You may disable these in your browser, but certain features may no longer work.</p>
      
      <h3>(c) Analytics Cookies</h3>
      <p>These cookies help us understand how users interact with LogiScore. They allow us to:</p>
      <ul>
        <li>Measure traffic and performance of pages.</li>
        <li>Identify popular features and improve usability.</li>
        <li>Use aggregated and anonymized reports for internal analysis.</li>
      </ul>
      
      <h3>(d) Marketing & Advertising Cookies</h3>
      <p>These cookies may be used to:</p>
      <ul>
        <li>Deliver relevant advertising for LogiScore subscriptions or services.</li>
        <li>Limit the number of times you see an advertisement.</li>
        <li>Measure the effectiveness of marketing campaigns.</li>
      </ul>
    </section>

    <section class="policy-section">
      <h2>4. Managing Your Preferences</h2>
      <p>When you first visit LogiScore, you will see a <strong>cookie consent banner</strong> allowing you to:</p>
      <ul>
        <li>Accept all cookies.</li>
        <li>Reject all but strictly necessary cookies.</li>
        <li>Customize your preferences by category.</li>
      </ul>
      <p>You can also update your preferences at any time through our <strong>[Cookie Settings]</strong> link in the website footer.</p>
    </section>

    <section class="policy-section">
      <h2>5. Third-Party Cookies</h2>
      <p>Some cookies are set by third parties that provide services on our behalf (e.g., analytics providers, payment processors). We do not control these cookies directly, and their use is subject to the third party's own privacy policies.</p>
    </section>

    <section class="policy-section">
      <h2>6. More Information</h2>
      <p>For more details on how LogiScore processes personal data, please review our <a href="/privacy">Privacy Policy</a>.</p>
      <p>If you have any questions about this Cookie Policy, contact us at:</p>
      <div class="contact-info">
        <p>📧 <a href="mailto:privacy@logiscore.net">privacy@logiscore.net</a></p>
      </div>
    </section>
  </div>

  <div class="footer-actions">
    <a href="/privacy" class="btn btn-secondary">Privacy Policy</a>
    <a href="/legal" class="btn btn-secondary">Legal FAQ</a>
    <a href="/contact" class="btn btn-primary">Contact Support</a>
  </div>
</div>

<style>
  .cookie-container {
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

  .policy-section h3 {
    color: #444;
    margin: 20px 0 10px 0;
    font-size: 1.1rem;
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

  .policy-section p {
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
    .cookie-container {
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
