<svelte:head>
  <title>Support - LogiScore</title>
  <meta name="description" content="Get help and support for LogiScore" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>Support Center</h1>
      <p class="hero-subtitle">We're here to help you get the most out of LogiScore</p>
    </div>
  </section>

  <section class="content">
    <div class="container">
      <div class="support-content">
        <h2>Need Help?</h2>
        <p>Our support team is ready to assist you with any questions or issues you may have.</p>
        
        <div class="support-options">
          <div class="support-option">
            <h3>📧 Email Support</h3>
            <p>Send us an email at support@logiscore.com</p>
            <a href="/contact" class="support-btn">Contact Us</a>
          </div>
          
          <div class="support-option">
            <h3>❓ FAQ</h3>
            <p>Find answers to common questions</p>
            <a href="/faq" class="support-btn">View FAQ</a>
          </div>
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
  }

  .content {
    padding: 80px 0;
  }

  .support-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .support-content h2 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }

  .support-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 3rem;
  }

  .support-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .support-option {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .support-option h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  .support-option p {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .support-btn {
    background: #667eea;
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    display: inline-block;
    transition: background 0.3s;
  }

  .support-btn:hover {
    background: #5a6fd8;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .support-options {
      grid-template-columns: 1fr;
    }
  }
</style>

