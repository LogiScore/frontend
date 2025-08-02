<script lang="ts">
  import Header from '$lib/components/Header.svelte';

  let formData = {
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  };

  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = '';

  function handleSubmit() {
    isSubmitting = true;
    submitError = '';
    
    // Simulate form submission
    setTimeout(() => {
      isSubmitting = false;
      submitSuccess = true;
      formData = {
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      };
    }, 2000);
  }
</script>

<svelte:head>
  <title>Contact Us - LogiScore</title>
  <meta name="description" content="Get in touch with the LogiScore team. We're here to help with your questions and feedback." />
</svelte:head>

<!-- Navigation Header -->
<Header currentPage="contact" />

<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">Contact Us</h1>
      <p class="hero-subtitle">
        We're here to help! Reach out to our team for support, partnership, or media inquiries.
      </p>
    </div>
  </div>
</section>

<!-- Contact Form -->
<section class="contact-form-section">
  <div class="container">
    <div class="form-wrapper">
      <h2>Send Us a Message</h2>
      <form class="contact-form" on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" bind:value={formData.name} required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" bind:value={formData.email} required />
        </div>
        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" bind:value={formData.subject} required />
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" bind:value={formData.message} required></textarea>
        </div>
        <button type="submit" class="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
        {#if submitSuccess}
          <div class="success-message">Thank you! Your message has been sent.</div>
        {/if}
        {#if submitError}
          <div class="error-message">{submitError}</div>
        {/if}
      </form>
    </div>
    <div class="contact-info">
      <h3>Contact Details</h3>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:support@logiscore.com">support@logiscore.com</a></li>
        <li><strong>Phone:</strong> <a href="tel:+1-555-0123">+1-555-0123</a></li>
        <li><strong>Address:</strong> 123 Logistics Ave, Singapore 123456</li>
      </ul>
      <h3>Follow Us</h3>
      <div class="social-links">
        <a href="#" aria-label="LinkedIn"><svg width="24" height="24" fill="currentColor"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>
        <a href="#" aria-label="Twitter"><svg width="24" height="24" fill="currentColor"><path d="M24 4.56c-.89.39-1.84.65-2.84.77 1.02-.61 1.8-1.57 2.17-2.72-.95.56-2.01.97-3.13 1.19-.9-.96-2.18-1.56-3.6-1.56-2.72 0-4.93 2.21-4.93 4.93 0 .39.04.77.12 1.13-4.1-.21-7.73-2.17-10.16-5.15-.43.74-.68 1.6-.68 2.52 0 1.74.89 3.28 2.25 4.18-.83-.03-1.61-.25-2.29-.63v.06c0 2.43 1.73 4.46 4.03 4.92-.42.12-.87.18-1.33.18-.32 0-.63-.03-.93-.09.63 1.97 2.45 3.41 4.6 3.45-1.69 1.33-3.82 2.12-6.13 2.12-.4 0-.79-.02-1.18-.07 2.19 1.41 4.8 2.24 7.6 2.24 9.12 0 14.12-7.56 14.12-14.12 0-.22 0-.43-.02-.65.97-.7 1.8-1.57 2.46-2.57z"/></svg></a>
        <a href="#" aria-label="Facebook"><svg width="24" height="24" fill="currentColor"><path d="M22.68 0h-21.36c-.73 0-1.32.59-1.32 1.32v21.36c0 .73.59 1.32 1.32 1.32h11.49v-9.29h-3.13v-3.62h3.13v-2.67c0-3.1 1.89-4.79 4.65-4.79 1.32 0 2.45.1 2.78.14v3.22h-1.91c-1.5 0-1.79.71-1.79 1.75v2.35h3.58l-.47 3.62h-3.11v9.29h6.09c.73 0 1.32-.59 1.32-1.32v-21.36c0-.73-.59-1.32-1.32-1.32z"/></svg></a>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Company</h3>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/press">Press</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Platform</h3>
        <ul>
          <li><a href="/how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/features">Features</a></li>
          <li><a href="/api">API</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Support</h3>
        <ul>
          <li><a href="/help">Help Center</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/guidelines">Guidelines</a></li>
          <li><a href="/contact-support">Contact Support</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Legal</h3>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
          <li><a href="/security">Security</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 LogiScore. All rights reserved.</p>
    </div>
  </div>
</footer>



<style>
  /* Global Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }



  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 100px 0;
    text-align: center;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.9;
  }

  /* Contact Form Section */
  .contact-form-section {
    padding: 80px 0;
    background: white;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .form-wrapper {
    max-width: 600px;
    margin: 0 auto 60px;
  }

  .form-wrapper h2 {
    font-size: 2rem;
    margin-bottom: 30px;
    color: #333;
    font-weight: 600;
  }

  .contact-form {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }

  .form-group {
    margin-bottom: 25px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  .contact-form input,
  .contact-form textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    transition: border-color 0.3s;
  }

  .contact-form input:focus,
  .contact-form textarea:focus {
    outline: none;
    border-color: #667eea;
  }

  .contact-form textarea {
    min-height: 120px;
    resize: vertical;
  }

  .contact-form button {
    width: 100%;
    margin-top: 20px;
    padding: 15px 30px;
    font-size: 1.1rem;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .success-message h3 {
    margin-bottom: 10px;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  /* Contact Info */
  .contact-info {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .contact-info h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
  }

  .contact-info ul {
    list-style: none;
    margin-bottom: 40px;
  }

  .contact-info li {
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: #666;
  }

  .contact-info a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .contact-info a:hover {
    text-decoration: underline;
  }

  /* Social Links */
  .social-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }

  .social-links a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #667eea;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s;
  }

  .social-links a:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
  }



  /* Footer */
  .footer {
    background: #333;
    color: white;
    padding: 60px 0 20px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section h3 {
    margin-bottom: 20px;
    color: #ffd700;
    font-weight: 600;
  }

  .footer-section ul {
    list-style: none;
  }

  .footer-section li {
    margin-bottom: 10px;
  }

  .footer-section a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.3s;
    font-weight: 400;
  }

  .footer-section a:hover {
    color: white;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #555;
    color: #ccc;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .nav-menu {
      display: none;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .contact-form {
      padding: 30px 20px;
    }

    .social-links {
      gap: 15px;
    }

    .social-links a {
      width: 45px;
      height: 45px;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
</style> 