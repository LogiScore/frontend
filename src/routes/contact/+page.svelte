<script>
  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = null;

  async function handleSubmit() {
    isSubmitting = true;
    submitError = null;

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      submitSuccess = true;
      formData = { name: '', email: '', subject: '', message: '' };
    } catch (error) {
      submitError = 'Failed to send message. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Contact Us - LogiScore</title>
  <meta name="description" content="Get in touch with the LogiScore team" />
</svelte:head>

<main>
  <section class="hero">
    <div class="container">
      <h1>Contact Us</h1>
      <p class="hero-subtitle">Get in touch with our team. We're here to help with any questions about LogiScore.</p>
    </div>
  </section>

  <section class="contact-content">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-info">
          <h2>Get In Touch</h2>
          <p>Have questions about LogiScore? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          
          <div class="contact-methods">
            <div class="contact-method">
              <h3>Email</h3>
              <p>support@logiscore.com</p>
            </div>
            
            <div class="contact-method">
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
            </div>
            
            <div class="contact-method">
              <h3>Response Time</h3>
              <p>We typically respond within 24 hours</p>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <h2>Send us a Message</h2>
          
          {#if submitSuccess}
            <div class="success-message">
              <h3>Message Sent!</h3>
              <p>Thank you for contacting us. We'll get back to you soon.</p>
            </div>
          {:else}
            <form on:submit|preventDefault={handleSubmit}>
              <div class="form-group">
                <label for="name">Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  bind:value={formData.name} 
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  bind:value={formData.email} 
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div class="form-group">
                <label for="subject">Subject *</label>
                <input 
                  type="text" 
                  id="subject" 
                  bind:value={formData.subject} 
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea 
                  id="message" 
                  bind:value={formData.message} 
                  rows="5" 
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>

              {#if submitError}
                <div class="error-message">
                  <p>{submitError}</p>
                </div>
              {/if}

              <button type="submit" class="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          {/if}
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

  .contact-content {
    padding: 80px 0;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .contact-info h2,
  .contact-form h2 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }

  .contact-info p {
    line-height: 1.6;
    margin-bottom: 2rem;
    color: #666;
  }

  .contact-methods {
    display: grid;
    gap: 2rem;
  }

  .contact-method h3 {
    color: #667eea;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  .contact-method p {
    color: #666;
    margin: 0;
  }

  .contact-form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #667eea;
  }

  .form-group input:disabled,
  .form-group textarea:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .submit-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
    width: 100%;
  }

  .submit-btn:hover:not(:disabled) {
    background: #5a6fd8;
  }

  .submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
  }

  .success-message h3 {
    margin-bottom: 0.5rem;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }
    
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }
</style>

