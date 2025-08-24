<script>
  import { apiClient } from '$lib/api';
  
  let formData = {
    name: '',
    email: '',
    contactReason: '',
    subject: '',
    message: ''
  };
  
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = null;
  let emailDetails = null;

  const contactReasons = [
    { value: '', label: 'Select a reason...' },
    { value: 'feedback', label: 'Tell us how well we are doing' },
    { value: 'support', label: 'Require technical support' },
    { value: 'billing', label: 'Billing, subscription and ads related' },
    { value: 'reviews', label: 'Queries about reviews' },
    { value: 'privacy', label: 'Data protection and privacy concerns' },
    { value: 'general', label: 'General inquiry' }
  ];

  async function handleSubmit() {
    isSubmitting = true;
    submitError = null;

    try {
      const result = await apiClient.sendContactFormEmail(formData);
      submitSuccess = true;
      emailDetails = result;
      formData = { name: '', email: '', contactReason: '', subject: '', message: '' };
    } catch (error) {
      submitError = error.message || 'Failed to send message. Please try again.';
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
  <!-- Modern Page Header -->
  <section class="page-header">
    <div class="container">
      <div class="breadcrumb">
        <a href="/" class="breadcrumb-item">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">Contact</span>
      </div>
      <p class="page-description">Get in touch with our team. We're here to help with any questions about LogiScore.</p>
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
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for contacting us. We'll get back to you soon.</p>
              
              {#if emailDetails}
                <div class="email-details">
                  <p><strong>Email Status:</strong></p>
                  <ul>
                    <li>✓ Message routed to appropriate team</li>
                    <li>✓ Acknowledgment sent to your email</li>
                  </ul>
                  <p class="response-time">We typically respond within 24 hours during business hours.</p>
                </div>
              {/if}
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
                <label for="contactReason">Why are you contacting us today? *</label>
                <select 
                  id="contactReason" 
                  bind:value={formData.contactReason} 
                  required
                  disabled={isSubmitting}
                >
                  {#each contactReasons as reason}
                    <option value={reason.value}>{reason.label}</option>
                  {/each}
                </select>
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
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* Page Header */
  .page-header {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 40px 0;
    margin-bottom: 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .breadcrumb-separator {
    color: #dee2e6;
  }

  .breadcrumb-item.active {
    color: #667eea;
    font-weight: 600;
  }

  .breadcrumb-item {
    text-decoration: none;
    color: #6c757d;
    transition: color 0.2s ease;
  }

  .breadcrumb-item:hover {
    color: #667eea;
  }

  .page-title {
    font-size: 2.5rem;
    margin-bottom: 12px;
    font-weight: 700;
    color: #2c3e50;
  }

  .page-description {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
    max-width: 600px;
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
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #667eea;
  }

  .form-group input:disabled,
  .form-group textarea:disabled,
  .form-group select:disabled {
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

  .email-details {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .email-details p {
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .email-details ul {
    list-style: none;
    padding: 0;
    margin-bottom: 0.5rem;
  }

  .email-details li {
    margin-bottom: 0.25rem;
    color: #333;
    padding-left: 1.5rem;
    position: relative;
  }

  .email-details li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
  }

  .response-time {
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.5rem;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 2rem;
    }
    
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }
</style>

