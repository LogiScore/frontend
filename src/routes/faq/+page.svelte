<script lang="ts">
  let openFaq: number | null = null;
  let openShipperFaq: number | null = null;
  let openForwarderFaq: number | null = null;

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
      id: 1,
      question: "Who can leave a review?",
      answer: "Only verified shippers with a valid shipment document (e.g., AWB, Bill of Lading) may submit a review. Verification is required once per forwarder during a subscription period."
    },
    {
      id: 2,
      question: "Can I leave a review anonymously?",
      answer: "Yes. You may choose to remain anonymous to forwarders and the public. However, anonymous reviews may carry less weight than named, verified reviews."
    },
    {
      id: 3,
      question: "What if I use multiple forwarders?",
      answer: "You may review each forwarder you've worked with, provided you verify your shipment activity with them."
    },
    {
      id: 4,
      question: "Are reviews opinions or verified facts?",
      answer: "All reviews represent the opinions and experiences of individual shippers. LogiScore does not verify the accuracy of each opinion and does not endorse any forwarder."
    },
    {
      id: 5,
      question: "What categories are used for scoring?",
      answer: "Ratings cover key service categories: Responsiveness, Shipment Management, Documentation Accuracy, Customer Experience, Technology & Visibility Tools, and Reliability & Proactivity."
    }
  ];

  const forwarderFaqs = [
    {
      id: 1,
      question: "Can forwarders submit reviews?",
      answer: "No. To ensure independence, only shippers may submit reviews."
    },
    {
      id: 2,
      question: "What if I disagree with a review?",
      answer: "Forwarders can submit a dispute via the Contact Page. LogiScore operates a structured Notice & Takedown process to review concerns and may remove content that violates our policies or the law."
    },
    {
      id: 3,
      question: "Can forwarders edit or remove reviews?",
      answer: "No. Forwarders cannot edit or delete reviews. This guarantees platform independence and fairness."
    },
    {
      id: 4,
      question: "How does LogiScore benefit forwarders?",
      answer: "LogiScore isn't only about accountability. High-performing forwarders can use their scores to showcase service quality to prospective customers, supporting sales teams with independent, third-party validation."
    },
    {
      id: 5,
      question: "Will I know which shipper left a review?",
      answer: "No. Identities remain confidential, unless disclosure is required under applicable law."
    }
  ];

  function toggleFaq(id: number): void {
    openFaq = openFaq === id ? null : id;
  }

  function toggleShipperFaq(id: number): void {
    openShipperFaq = openShipperFaq === id ? null : id;
  }

  function toggleForwarderFaq(id: number): void {
    openForwarderFaq = openForwarderFaq === id ? null : id;
  }
</script>

<svelte:head>
  <title>FAQ - LogiScore</title>
  <meta name="description" content="Frequently asked questions about LogiScore" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>Frequently Asked Questions</h1>
      <p class="hero-subtitle">Find answers to common questions about LogiScore</p>
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
              <button 
                class="faq-question" 
                on:click={() => toggleFaq(faq.id)}
                class:active={openFaq === faq.id}
              >
                <span>{faq.question}</span>
                <span class="faq-icon">{openFaq === faq.id ? '−' : '+'}</span>
              </button>
              {#if openFaq === faq.id}
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Shipper FAQ Section -->
      <div class="faq-section">
        <h2>Shipper FAQ</h2>
        <div class="faq-grid">
          {#each shipperFaqs as faq}
            <div class="faq-item">
              <button 
                class="faq-question" 
                on:click={() => toggleShipperFaq(faq.id)}
                class:active={openShipperFaq === faq.id}
              >
                <span>{faq.question}</span>
                <span class="faq-icon">{openShipperFaq === faq.id ? '−' : '+'}</span>
              </button>
              {#if openShipperFaq === faq.id}
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Forwarder FAQ Section -->
      <div class="faq-section">
        <h2>Forwarder FAQ</h2>
        <div class="faq-grid">
          {#each forwarderFaqs as faq}
            <div class="faq-item">
              <button 
                class="faq-question" 
                on:click={() => toggleForwarderFaq(faq.id)}
                class:active={openForwarderFaq === faq.id}
              >
                <span>{faq.question}</span>
                <span class="faq-icon">{openForwarderFaq === faq.id ? '−' : '+'}</span>
              </button>
              {#if openForwarderFaq === faq.id}
                <div class="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="contact-section">
        <h2>Still Have Questions?</h2>
        <p>Can't find what you're looking for? Our support team is here to help.</p>
        <a href="/contact" class="contact-btn">Contact Support</a>
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

  .faq-grid {
    max-width: 800px;
    margin: 0 auto 2rem auto;
  }

  .faq-item {
    border-bottom: 1px solid #eee;
  }

  .faq-question {
    width: 100%;
    padding: 1.5rem 0;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.1rem;
    color: #333;
    transition: color 0.3s;
  }

  .faq-question:hover {
    color: #667eea;
  }

  .faq-question.active {
    color: #667eea;
  }

  .faq-icon {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
  }

  .faq-answer {
    padding: 0 0 1.5rem 0;
  }

  .faq-answer p {
    color: #666;
    line-height: 1.6;
    margin: 0;
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

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .faq-question {
      font-size: 1rem;
      padding: 1rem 0;
    }
    
    .contact-section {
      padding: 2rem;
    }

    .faq-section h2 {
      font-size: 1.8rem;
    }
  }
</style>

