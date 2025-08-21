<script lang="ts">
  let openShipperFaq = false;
  let openForwarderFaq = false;
  let openGettingStartedFaq = false;
  let openSearchReviewsFaq = false;
  let openBillingFaq = false;
  let openAccountFaq = false;

  const faqs = [
    {
      id: 1,
      question: "What is LogiScore?",
      answer: "LogiScore is a platform that helps businesses find and compare freight forwarders through verified reviews and ratings. We provide transparency in the logistics industry by connecting shippers with real customer experiences."
    },
    {
      id: 2,
      question: "How do I find a freight forwarder?",
      answer: "You can search for freight forwarders by company name, location, or services offered. Our platform provides detailed information about each company including their services, locations, and customer reviews."
    },
    {
      id: 3,
      question: "Are the reviews verified?",
      answer: "We're working on implementing a verification system to ensure all reviews come from real customers. Currently, we're building the infrastructure to support verified reviews."
    },
    {
      id: 4,
      question: "How can I leave a review?",
      answer: "Our review system is currently in development. Soon, you'll be able to create an account and leave detailed reviews about your experiences with freight forwarders."
    },
    {
      id: 5,
      question: "Is LogiScore free to use?",
      answer: "Yes, LogiScore is free to use for searching and reading reviews. We may introduce premium features in the future, but basic access will remain free."
    },
    {
      id: 6,
      question: "How do I contact support?",
      answer: "You can reach our support team through the Contact page or by emailing support@logiscore.com. We typically respond within 24 hours during business days."
    }
  ];

  const shipperFaqs = [
    {
      question: "Who can leave a review?",
      answer: "Only verified shippers with a valid shipment document (e.g., AWB, Bill of Lading) may submit a review. Verification is required once per forwarder during a subscription period."
    },
    {
      question: "Can I leave a review anonymously?",
      answer: "Yes. You may choose to remain anonymous to forwarders and the public. However, anonymous reviews may carry less weight than named, verified reviews."
    },
    {
      question: "What if I use multiple forwarders?",
      answer: "You may review each forwarder you've worked with, provided you verify your shipment activity with them."
    },
    {
      question: "Are reviews opinions or verified facts?",
      answer: "All reviews represent the opinions and experiences of individual shippers. LogiScore does not verify the accuracy of each opinion and does not endorse any forwarder."
    },
    {
      question: "What categories are used for scoring?",
      answer: "Ratings cover key service categories: Responsiveness, Shipment Management, Documentation Accuracy, Customer Experience, Technology & Visibility Tools, and Reliability & Proactivity."
    }
  ];

  const forwarderFaqs = [
    {
      question: "Can forwarders submit reviews?",
      answer: "No. To ensure independence, only shippers may submit reviews."
    },
    {
      question: "What if I disagree with a review?",
      answer: "Forwarders can submit a dispute via the Contact Page. LogiScore operates a structured Notice & Takedown process to review concerns and may remove content that violates our policies or the law."
    },
    {
      question: "Can forwarders edit or remove reviews?",
      answer: "No. Forwarders cannot edit or delete reviews. This guarantees platform independence and fairness."
    },
    {
      question: "How does LogiScore benefit forwarders?",
      answer: "LogiScore isn't only about accountability. High-performing forwarders can use their scores to showcase service quality to prospective customers, supporting sales teams with independent, third-party validation."
    },
    {
      question: "Will I know which shipper left a review?",
      answer: "No. Identities remain confidential, unless disclosure is required under applicable law."
    }
  ];

  const gettingStartedFaqs = [
    {
      question: "How do I set up my LogiScore account?",
      answer: "Creating an account is simple. Click 'Sign Up' and provide your email address. We'll send you a verification code to confirm your email. Once verified, you can complete your profile with company information and preferences."
    },
    {
      question: "How do I perform my first search?",
      answer: "Use the search bar at the top of the page. You can search by company name, location, or services. Use filters to narrow down results by rating, review count, or specific criteria that matter to you."
    },
    {
      question: "How do I write helpful reviews?",
      answer: "Focus on specific experiences, provide concrete examples, and rate each category honestly. Include details about what went well and areas for improvement. Remember, your review helps other shippers make informed decisions."
    },
    {
      question: "How does the rating system work?",
      answer: "Our rating system uses 7 key categories: Responsiveness, Shipment Management, Documentation Accuracy, Customer Experience, Technology & Visibility Tools, Reliability & Proactivity, and Overall Satisfaction. Each category is rated on a 1-5 scale."
    }
  ];

  const searchReviewsFaqs = [
    {
      question: "What are advanced search techniques?",
      answer: "Use quotation marks for exact phrases, combine multiple search terms, and utilize our advanced filters. You can filter by rating range, review count, location, and specific service categories to find the perfect match."
    },
    {
      question: "How do I use filters effectively?",
      answer: "Start with broad filters and narrow down gradually. Use rating filters to focus on companies with proven track records, location filters for proximity, and service filters for specific needs. Combine multiple filters for precise results."
    },
    {
      question: "What are the review guidelines?",
      answer: "Reviews must be based on real experiences, avoid personal attacks, and provide constructive feedback. Include specific details, rate all categories honestly, and respect confidentiality. Reviews that violate guidelines may be removed."
    },
    {
      question: "How are ratings calculated?",
      answer: "Ratings are calculated from verified user reviews, with each category weighted equally. We use a weighted average system that considers review recency and verification status. Category scores are averaged to create overall company ratings."
    }
  ];

  const billingFaqs = [
    {
      question: "What subscription plans are available?",
      answer: "We offer multiple subscription tiers: Basic (free), Professional, and Enterprise. Each tier provides different levels of access to detailed analytics, location scores, and advanced search features. Visit our pricing page for detailed comparisons."
    },
    {
      question: "How do billing cycles work?",
      answer: "Subscriptions are billed monthly or annually. Monthly plans renew automatically on the same date each month. Annual plans offer discounted rates and renew yearly. You can change your billing cycle at any time from your account settings."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and debit cards. All payments are processed securely through Stripe with bank-level encryption. We also support digital wallets like Apple Pay and Google Pay."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from your account settings. Cancellation takes effect at the end of your current billing period. You'll continue to have access to premium features until the end of the period you've already paid for."
    }
  ];

  const accountFaqs = [
    {
      question: "How do I update my profile information?",
      answer: "Go to your profile settings from the account menu. You can update your personal information, company details, preferences, and notification settings. Changes are saved automatically as you make them."
    },
    {
      question: "How do I manage my privacy settings?",
      answer: "Control your data sharing and privacy preferences in your account settings. Choose what information is visible to other users, manage review anonymity settings, and control how your data is used for platform improvements."
    },
    {
      question: "How do I configure notifications?",
      answer: "Customize your notification preferences in account settings. Choose to receive email alerts for new reviews, rating changes, or important updates. You can also set notification frequency and types."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your review data, profile information, and search history. Go to account settings and use the data export feature. Exports are provided in CSV format and typically processed within 24 hours."
    }
  ];

  function toggleShipperFaq(): void {
    openShipperFaq = !openShipperFaq;
  }

  function toggleForwarderFaq(): void {
    openForwarderFaq = !openForwarderFaq;
  }

  function toggleGettingStartedFaq(): void {
    openGettingStartedFaq = !openGettingStartedFaq;
  }

  function toggleSearchReviewsFaq(): void {
    openSearchReviewsFaq = !openSearchReviewsFaq;
  }

  function toggleBillingFaq(): void {
    openBillingFaq = !openBillingFaq;
  }

  function toggleAccountFaq(): void {
    openAccountFaq = !openAccountFaq;
  }
</script>

<svelte:head>
  <title>FAQ - LogiScore</title>
  <meta name="description" content="Frequently asked questions about LogiScore - comprehensive help and support" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>Frequently Asked Questions</h1>
      <p class="hero-subtitle">Find comprehensive answers to all your questions about LogiScore</p>
    </div>
  </section>

  <section class="faq-content">
    <div class="container">
      <!-- General FAQ Section -->
      <div class="faq-section">
        <h2>General Questions</h2>
        <div class="faq-grid">
          {#each faqs as faq}
            <div class="faq-item">
              <h3 class="faq-question-text">{faq.question}</h3>
              <div class="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Getting Started FAQ Section -->
      <div class="faq-section">
        <button class="section-toggle" on:click={toggleGettingStartedFaq}>
          <h2>🚀 Getting Started</h2>
          <span class="toggle-icon">{openGettingStartedFaq ? '−' : '+'}</span>
        </button>
        {#if openGettingStartedFaq}
          <div class="faq-content-expanded">
            {#each gettingStartedFaqs as faq}
              <div class="faq-item-expanded">
                <h3 class="faq-question-text">{faq.question}</h3>
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Search & Reviews FAQ Section -->
      <div class="faq-section">
        <button class="section-toggle" on:click={toggleSearchReviewsFaq}>
          <h2>🔍 Search & Reviews</h2>
          <span class="toggle-icon">{openSearchReviewsFaq ? '−' : '+'}</span>
        </button>
        {#if openSearchReviewsFaq}
          <div class="faq-content-expanded">
            {#each searchReviewsFaqs as faq}
              <div class="faq-item-expanded">
                <h3 class="faq-question-text">{faq.question}</h3>
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Shipper FAQ Section -->
      <div class="faq-section">
        <button class="section-toggle" on:click={toggleShipperFaq}>
          <h2>📦 Shipper FAQ</h2>
          <span class="toggle-icon">{openShipperFaq ? '−' : '+'}</span>
        </button>
        {#if openShipperFaq}
          <div class="faq-content-expanded">
            {#each shipperFaqs as faq}
              <div class="faq-item-expanded">
                <h3 class="faq-question-text">{faq.question}</h3>
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Forwarder FAQ Section -->
      <div class="faq-section">
        <button class="section-toggle" on:click={toggleForwarderFaq}>
          <h2>🚢 Forwarder FAQ</h2>
          <span class="toggle-icon">{openForwarderFaq ? '−' : '+'}</span>
        </button>
        {#if openForwarderFaq}
          <div class="faq-content-expanded">
            {#each forwarderFaqs as faq}
              <div class="faq-item-expanded">
                <h3 class="faq-question-text">{faq.question}</h3>
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Billing & Plans FAQ Section -->
      <div class="faq-section">
        <button class="section-toggle" on:click={toggleBillingFaq}>
          <h2>💳 Billing & Plans</h2>
          <span class="toggle-icon">{openBillingFaq ? '−' : '+'}</span>
        </button>
        {#if openBillingFaq}
          <div class="faq-content-expanded">
            {#each billingFaqs as faq}
              <div class="faq-item-expanded">
                <h3 class="faq-question-text">{faq.question}</h3>
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Account & Settings FAQ Section -->
      <div class="faq-section">
        <button class="section-toggle" on:click={toggleAccountFaq}>
          <h2>🔧 Account & Settings</h2>
          <span class="toggle-icon">{openAccountFaq ? '−' : '+'}</span>
        </button>
        {#if openAccountFaq}
          <div class="faq-content-expanded">
            {#each accountFaqs as faq}
              <div class="faq-item-expanded">
                <h3 class="faq-question-text">{faq.question}</h3>
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="contact-section">
        <h2>Still Have Questions?</h2>
        <p>Can't find what you're looking for? Our support team is here to help.</p>
        <div class="contact-buttons">
          <a href="/contact" class="contact-btn">Contact Support</a>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
  }

  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .faq-content {
    padding: 80px 0;
  }

  .faq-section {
    margin-bottom: 4rem;
  }

  .faq-section h2 {
    color: #333;
    margin-bottom: 2rem;
    font-size: 2.2rem;
    text-align: center;
    border-bottom: 3px solid #667eea;
    padding-bottom: 1rem;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  .section-toggle {
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    padding: 0;
    margin-bottom: 2rem;
  }

  .section-toggle h2 {
    color: #333;
    font-size: 2.2rem;
    text-align: center;
    border-bottom: 3px solid #667eea;
    padding-bottom: 1rem;
    max-width: 300px;
    margin: 0 auto 2rem auto;
    transition: color 0.3s;
  }

  .section-toggle:hover h2 {
    color: #667eea;
  }

  .toggle-icon {
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
    display: block;
    text-align: center;
    margin-top: 1rem;
  }

  .faq-grid {
    max-width: 800px;
    margin: 0 auto 2rem auto;
  }

  .faq-item {
    border-bottom: 1px solid #eee;
    padding: 1.5rem 0;
  }

  .faq-item-expanded {
    border-bottom: 1px solid #eee;
    padding: 1.5rem 0;
  }

  .faq-question-text {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .faq-answer {
    padding: 0;
  }

  .faq-answer p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  .faq-content-expanded {
    max-width: 800px;
    margin: 0 auto;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .contact-section {
    text-align: center;
    background: #f8f9fa;
    padding: 3rem;
    border-radius: 12px;
    max-width: 600px;
    margin: 0 auto;
  }

  .contact-section h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  .contact-section p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .contact-btn {
    background: #667eea;
    color: white;
    text-decoration: none;
    padding: 1rem 2rem;
    border-radius: 6px;
    display: inline-block;
    transition: background 0.3s;
  }

  .contact-btn:hover {
    background: #5a6fd8;
  }

  .contact-buttons {
    /* Single button is centered by parent text-align: center */
  }



  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .faq-section h2,
    .section-toggle h2 {
      font-size: 1.8rem;
    }
    
    .contact-section {
      padding: 2rem;
    }
    
    .contact-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
</style>

