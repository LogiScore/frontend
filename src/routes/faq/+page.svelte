<script>
  let openFaq = null;

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

  function toggleFaq(id) {
    openFaq = openFaq === id ? null : id;
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

  .faq-grid {
    max-width: 800px;
    margin: 0 auto 4rem auto;
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
  }
</style>

