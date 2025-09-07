<script lang="ts">
  import { apiClient } from '$lib/api';
  import { auth } from '$lib/auth';

  let isLoading = false;
  let result = '';
  let error = '';

  async function testTrialReminder() {
    if (!$auth.user) {
      error = 'Please log in to test trial reminders';
      return;
    }

    isLoading = true;
    error = '';
    result = '';

    try {
      // Test getting trials ending soon
      const trialsResponse = await apiClient.getTrialsEndingSoon(24);
      result = `✅ Trials ending soon: ${trialsResponse.count} found\n`;
      
      // Test sending trial warning (using current user as test)
      const trialData = {
        trial_duration: 7,
        plan_name: 'Subscription Monthly',
        plan_price: 38,
        billing_cycle: 'month',
        trial_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        plan_features: [
          'Search for Forwarders and view aggregated scores',
          'Full numerical score display',
          'Single user subscription'
        ]
      };

      const warningResponse = await apiClient.sendTrialWarning($auth.user.id, trialData);
      result += `✅ Trial warning sent: ${warningResponse.message}\n`;
      result += `📧 Email sent to: ${warningResponse.email_sent_to}\n`;

    } catch (err: any) {
      error = `❌ Error testing trial reminders: ${err.message}`;
      console.error('Trial reminder test error:', err);
    } finally {
      isLoading = false;
    }
  }

  async function testTrialEnded() {
    if (!$auth.user) {
      error = 'Please log in to test trial reminders';
      return;
    }

    isLoading = true;
    error = '';
    result = '';

    try {
      const trialData = {
        trial_duration: 7,
        plan_name: 'Subscription Monthly',
        plan_price: 38,
        billing_cycle: 'month',
        trial_end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };

      const endedResponse = await apiClient.sendTrialEndedNotification($auth.user.id, trialData);
      result = `✅ Trial ended notification sent: ${endedResponse.message}\n`;
      result += `📧 Email sent to: ${endedResponse.email_sent_to}\n`;

    } catch (err: any) {
      error = `❌ Error testing trial ended notification: ${err.message}`;
      console.error('Trial ended test error:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="trial-test-container">
  <h3>🧪 Trial Reminder System Test</h3>
  
  <div class="test-buttons">
    <button 
      class="btn-primary" 
      on:click={testTrialReminder} 
      disabled={isLoading || !$auth.user}
    >
      {isLoading ? 'Testing...' : 'Test Trial Warning'}
    </button>
    
    <button 
      class="btn-secondary" 
      on:click={testTrialEnded} 
      disabled={isLoading || !$auth.user}
    >
      {isLoading ? 'Testing...' : 'Test Trial Ended'}
    </button>
  </div>

  {#if !$auth.user}
    <p class="warning">⚠️ Please log in to test trial reminder functionality</p>
  {/if}

  {#if result}
    <div class="result success">
      <h4>✅ Test Results:</h4>
      <pre>{result}</pre>
    </div>
  {/if}

  {#if error}
    <div class="result error">
      <h4>❌ Error:</h4>
      <pre>{error}</pre>
    </div>
  {/if}

  <div class="info">
    <h4>📋 What this tests:</h4>
    <ul>
      <li><strong>Get Trials Ending Soon:</strong> Fetches users with trials ending in 24 hours</li>
      <li><strong>Send Trial Warning:</strong> Sends trial ending warning email</li>
      <li><strong>Send Trial Ended:</strong> Sends trial ended notification email</li>
    </ul>
    
    <p><strong>Note:</strong> This will send actual emails to your account. Use only for testing!</p>
  </div>
</div>

<style>
  .trial-test-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f8f9fa;
  }

  .test-buttons {
    display: flex;
    gap: 10px;
    margin: 20px 0;
  }

  .btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #545b62;
  }

  .btn-primary:disabled, .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .warning {
    color: #856404;
    background: #fff3cd;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ffeaa7;
  }

  .result {
    margin: 20px 0;
    padding: 15px;
    border-radius: 4px;
  }

  .result.success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }

  .result.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }

  .result pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
  }

  .info {
    background: white;
    padding: 15px;
    border-radius: 4px;
    margin-top: 20px;
  }

  .info h4 {
    margin-top: 0;
    color: #333;
  }

  .info ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  .info li {
    margin: 5px 0;
  }
</style>
