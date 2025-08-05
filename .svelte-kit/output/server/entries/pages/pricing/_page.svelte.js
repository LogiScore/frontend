import { J as copy_payload, K as assign_payload, w as pop, u as push, O as head, y as escape_html, N as ensure_array_like, P as attr_class } from "../../../chunks/index.js";
import { g as getPlansForUserType, S as SubscriptionModal } from "../../../chunks/SubscriptionModal.js";
import { a as auth } from "../../../chunks/auth.js";
function _page($$payload, $$props) {
  push();
  let userPlans, userType;
  let authState = { user: null };
  auth.subscribe((state) => {
    authState = state;
  });
  let showSubscriptionModal = false;
  userPlans = authState.user ? getPlansForUserType(authState.user.user_type) : [];
  userType = authState.user?.user_type || "shipper";
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>Pricing - LogiScore Plans &amp; Features</title>`;
      $$payload3.out.push(`<meta name="description" content="Choose the perfect LogiScore plan for your business. Free, Pro, and Enterprise plans available for shippers and freight forwarders." class="svelte-1fec2bt"/>`);
    });
    $$payload2.out.push(`<header class="header svelte-1fec2bt"><div class="container svelte-1fec2bt"><nav class="nav-menu svelte-1fec2bt"><a href="/" class="logo svelte-1fec2bt">LogiScore</a> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt"><a href="/how-it-works" class="svelte-1fec2bt">How It Works</a></li> <li class="svelte-1fec2bt"><a href="/features" class="svelte-1fec2bt">Features</a></li> <li class="svelte-1fec2bt"><a href="/pricing" class="svelte-1fec2bt">Pricing</a></li> <li class="svelte-1fec2bt"><a href="/api" class="svelte-1fec2bt">API</a></li> <li class="svelte-1fec2bt"><a href="/contact" class="svelte-1fec2bt">Contact</a></li> <li class="svelte-1fec2bt"><a href="/login" class="btn-primary svelte-1fec2bt">Login</a></li> <li class="svelte-1fec2bt"><a href="/signup" class="btn-secondary svelte-1fec2bt">Sign Up</a></li></ul></nav></div></header> <section class="hero svelte-1fec2bt"><div class="container svelte-1fec2bt"><div class="hero-content svelte-1fec2bt"><h1 class="hero-title svelte-1fec2bt">`);
    if (authState.user) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`${escape_html(userType === "shipper" ? "Shipper" : "Freight Forwarder")} Pricing Plans`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`Simple, Transparent Pricing`);
    }
    $$payload2.out.push(`<!--]--></h1> <p class="hero-subtitle svelte-1fec2bt">`);
    if (authState.user) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`Choose the perfect plan for your ${escape_html(userType === "shipper" ? "shipping" : "freight forwarding")} business.`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`Choose the plan that's right for your business. No hidden fees, no surprises.`);
    }
    $$payload2.out.push(`<!--]--></p></div></div></section> <section class="pricing svelte-1fec2bt"><div class="container svelte-1fec2bt">`);
    if (authState.user) {
      $$payload2.out.push("<!--[-->");
      const each_array = ensure_array_like(userPlans);
      $$payload2.out.push(`<div class="plans-grid svelte-1fec2bt"><!--[-->`);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let plan = each_array[$$index_1];
        const each_array_1 = ensure_array_like(plan.features);
        $$payload2.out.push(`<div${attr_class("plan-card svelte-1fec2bt", void 0, { "featured": plan.isPopular })}>`);
        if (plan.isPopular) {
          $$payload2.out.push("<!--[-->");
          $$payload2.out.push(`<div class="plan-badge svelte-1fec2bt">Most Popular</div>`);
        } else {
          $$payload2.out.push("<!--[!-->");
        }
        $$payload2.out.push(`<!--]--> <div class="plan-header svelte-1fec2bt"><h3 class="svelte-1fec2bt">${escape_html(plan.name)}</h3> <div class="price svelte-1fec2bt"><span class="amount svelte-1fec2bt">$${escape_html(plan.price)}</span> <span class="period svelte-1fec2bt">/${escape_html(plan.billingCycle)}</span></div> <p class="plan-description svelte-1fec2bt">${escape_html(plan.description)}</p></div> <div class="plan-features svelte-1fec2bt"><ul class="svelte-1fec2bt"><!--[-->`);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let feature = each_array_1[$$index];
          $$payload2.out.push(`<li class="svelte-1fec2bt">✓ ${escape_html(feature)}</li>`);
        }
        $$payload2.out.push(`<!--]--></ul></div> <div class="plan-actions svelte-1fec2bt">`);
        if (plan.name === "Basic") {
          $$payload2.out.push("<!--[-->");
          $$payload2.out.push(`<button class="btn-secondary svelte-1fec2bt">Get Started Free</button>`);
        } else {
          $$payload2.out.push("<!--[!-->");
          $$payload2.out.push(`<button class="btn-primary svelte-1fec2bt">Start ${escape_html(plan.name)} Trial</button>`);
        }
        $$payload2.out.push(`<!--]--></div></div>`);
      }
      $$payload2.out.push(`<!--]--></div>`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<div class="plans-grid svelte-1fec2bt"><div class="plan-card svelte-1fec2bt"><div class="plan-header svelte-1fec2bt"><h3 class="svelte-1fec2bt">Free</h3> <div class="price svelte-1fec2bt"><span class="amount svelte-1fec2bt">$0</span> <span class="period svelte-1fec2bt">/month</span></div> <p class="plan-description svelte-1fec2bt">Perfect for getting started</p></div> <div class="plan-features svelte-1fec2bt"><ul class="svelte-1fec2bt"><li class="svelte-1fec2bt">✓ Search freight forwarders</li> <li class="svelte-1fec2bt">✓ Read basic reviews</li> <li class="svelte-1fec2bt">✓ Submit reviews</li> <li class="svelte-1fec2bt">✓ Basic company profiles</li> <li class="svelte-1fec2bt">✓ Email support</li></ul></div> <div class="plan-actions svelte-1fec2bt"><button class="btn-secondary svelte-1fec2bt">Get Started Free</button></div></div> <div class="plan-card featured svelte-1fec2bt"><div class="plan-badge svelte-1fec2bt">Most Popular</div> <div class="plan-header svelte-1fec2bt"><h3 class="svelte-1fec2bt">Pro</h3> <div class="price svelte-1fec2bt"><span class="amount svelte-1fec2bt">$99</span> <span class="period svelte-1fec2bt">/month</span></div> <p class="plan-description svelte-1fec2bt">For serious shippers</p></div> <div class="plan-features svelte-1fec2bt"><ul class="svelte-1fec2bt"><li class="svelte-1fec2bt">✓ Everything in Free</li> <li class="svelte-1fec2bt">✓ Detailed analytics</li> <li class="svelte-1fec2bt">✓ Branch-level reviews</li> <li class="svelte-1fec2bt">✓ Advanced search filters</li> <li class="svelte-1fec2bt">✓ Export reports</li> <li class="svelte-1fec2bt">✓ Priority support</li> <li class="svelte-1fec2bt">✓ Custom alerts</li></ul></div> <div class="plan-actions svelte-1fec2bt"><button class="btn-primary svelte-1fec2bt">Start Pro Trial</button></div></div> <div class="plan-card svelte-1fec2bt"><div class="plan-header svelte-1fec2bt"><h3 class="svelte-1fec2bt">Enterprise</h3> <div class="price svelte-1fec2bt"><span class="amount svelte-1fec2bt">$299</span> <span class="period svelte-1fec2bt">/month</span></div> <p class="plan-description svelte-1fec2bt">For large organizations</p></div> <div class="plan-features svelte-1fec2bt"><ul class="svelte-1fec2bt"><li class="svelte-1fec2bt">✓ Everything in Pro</li> <li class="svelte-1fec2bt">✓ API access</li> <li class="svelte-1fec2bt">✓ Custom integrations</li> <li class="svelte-1fec2bt">✓ Dedicated account manager</li> <li class="svelte-1fec2bt">✓ White-label reports</li> <li class="svelte-1fec2bt">✓ Advanced analytics</li> <li class="svelte-1fec2bt">✓ 24/7 phone support</li></ul></div> <div class="plan-actions svelte-1fec2bt"><button class="btn-secondary svelte-1fec2bt">Contact Sales</button></div></div></div>`);
    }
    $$payload2.out.push(`<!--]--></div></section> `);
    if (!authState.user) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<section class="plan-selection svelte-1fec2bt"><div class="container svelte-1fec2bt"><h2 class="svelte-1fec2bt">Choose Your Plan Type</h2> <p class="section-subtitle svelte-1fec2bt">Select the plan type that matches your business needs</p> <div class="plan-type-grid svelte-1fec2bt"><div class="plan-type-card svelte-1fec2bt"><h3 class="svelte-1fec2bt">Shipper Plans</h3> <p class="svelte-1fec2bt">Find and review freight forwarders to make informed shipping decisions.</p> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt">✓ Search freight forwarders</li> <li class="svelte-1fec2bt">✓ Read detailed reviews</li> <li class="svelte-1fec2bt">✓ Compare companies</li> <li class="svelte-1fec2bt">✓ Export reports</li></ul> <button class="btn-primary svelte-1fec2bt">View Shipper Plans</button></div> <div class="plan-type-card svelte-1fec2bt"><h3 class="svelte-1fec2bt">Freight Forwarder Plans</h3> <p class="svelte-1fec2bt">Monitor and improve your reputation on LogiScore.</p> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt">✓ Monitor your ratings</li> <li class="svelte-1fec2bt">✓ Respond to reviews</li> <li class="svelte-1fec2bt">✓ Detailed analytics</li> <li class="svelte-1fec2bt">✓ Reputation management</li></ul> <button class="btn-primary svelte-1fec2bt">View Forwarder Plans</button></div></div></div></section>`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> <section class="faq svelte-1fec2bt"><div class="container svelte-1fec2bt"><h2 class="svelte-1fec2bt">Frequently Asked Questions</h2> <div class="faq-grid svelte-1fec2bt"><div class="faq-item svelte-1fec2bt"><h3 class="svelte-1fec2bt">Can I cancel anytime?</h3> <p class="svelte-1fec2bt">Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.</p></div> <div class="faq-item svelte-1fec2bt"><h3 class="svelte-1fec2bt">Is there a free trial?</h3> <p class="svelte-1fec2bt">Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.</p></div> <div class="faq-item svelte-1fec2bt"><h3 class="svelte-1fec2bt">What payment methods do you accept?</h3> <p class="svelte-1fec2bt">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p></div> <div class="faq-item svelte-1fec2bt"><h3 class="svelte-1fec2bt">Do you offer discounts?</h3> <p class="svelte-1fec2bt">Yes, we offer discounts for annual subscriptions and enterprise customers. Contact us for details.</p></div> <div class="faq-item svelte-1fec2bt"><h3 class="svelte-1fec2bt">Can I upgrade or downgrade?</h3> <p class="svelte-1fec2bt">Yes, you can change your plan at any time. Changes take effect immediately.</p></div> <div class="faq-item svelte-1fec2bt"><h3 class="svelte-1fec2bt">What's included in support?</h3> <p class="svelte-1fec2bt">Free plan includes email support. Pro and Enterprise plans include priority support and dedicated assistance.</p></div></div></div></section> <section class="cta svelte-1fec2bt"><div class="container svelte-1fec2bt"><div class="cta-content svelte-1fec2bt"><h2 class="svelte-1fec2bt">Ready to Get Started?</h2> <p class="svelte-1fec2bt">Join thousands of businesses making informed logistics decisions.</p> <div class="cta-buttons svelte-1fec2bt"><a href="/search" class="btn-primary svelte-1fec2bt">Start Free Trial</a> <a href="/contact" class="btn-secondary svelte-1fec2bt">Contact Sales</a></div></div></div></section> <footer class="footer svelte-1fec2bt"><div class="container svelte-1fec2bt"><div class="footer-content svelte-1fec2bt"><div class="footer-section svelte-1fec2bt"><h3 class="svelte-1fec2bt">Company</h3> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt"><a href="/about" class="svelte-1fec2bt">About</a></li> <li class="svelte-1fec2bt"><a href="/careers" class="svelte-1fec2bt">Careers</a></li> <li class="svelte-1fec2bt"><a href="/press" class="svelte-1fec2bt">Press</a></li> <li class="svelte-1fec2bt"><a href="/contact" class="svelte-1fec2bt">Contact</a></li></ul></div> <div class="footer-section svelte-1fec2bt"><h3 class="svelte-1fec2bt">Platform</h3> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt"><a href="/how-it-works" class="svelte-1fec2bt">How It Works</a></li> <li class="svelte-1fec2bt"><a href="/pricing" class="svelte-1fec2bt">Pricing</a></li> <li class="svelte-1fec2bt"><a href="/features" class="svelte-1fec2bt">Features</a></li> <li class="svelte-1fec2bt"><a href="/api" class="svelte-1fec2bt">API</a></li></ul></div> <div class="footer-section svelte-1fec2bt"><h3 class="svelte-1fec2bt">Support</h3> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt"><a href="/help" class="svelte-1fec2bt">Help Center</a></li> <li class="svelte-1fec2bt"><a href="/faq" class="svelte-1fec2bt">FAQ</a></li> <li class="svelte-1fec2bt"><a href="/guidelines" class="svelte-1fec2bt">Guidelines</a></li> <li class="svelte-1fec2bt"><a href="/contact-support" class="svelte-1fec2bt">Contact Support</a></li></ul></div> <div class="footer-section svelte-1fec2bt"><h3 class="svelte-1fec2bt">Legal</h3> <ul class="svelte-1fec2bt"><li class="svelte-1fec2bt"><a href="/privacy" class="svelte-1fec2bt">Privacy Policy</a></li> <li class="svelte-1fec2bt"><a href="/terms" class="svelte-1fec2bt">Terms of Service</a></li> <li class="svelte-1fec2bt"><a href="/cookies" class="svelte-1fec2bt">Cookie Policy</a></li> <li class="svelte-1fec2bt"><a href="/security" class="svelte-1fec2bt">Security</a></li></ul></div></div> <div class="footer-bottom svelte-1fec2bt"><p class="svelte-1fec2bt">© 2025 LogiScore. All rights reserved.</p></div></div></footer>  `);
    SubscriptionModal($$payload2, {
      get isOpen() {
        return showSubscriptionModal;
      },
      set isOpen($$value) {
        showSubscriptionModal = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
export {
  _page as default
};
