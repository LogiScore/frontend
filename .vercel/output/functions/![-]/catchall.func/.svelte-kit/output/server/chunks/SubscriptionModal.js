import { u as push, y as escape_html, N as ensure_array_like, P as attr_class, F as bind_props, w as pop } from "./index.js";
import { k as fallback } from "./equality.js";
import { a as auth, b as apiClient } from "./auth.js";
const subscriptionPlans = [
  // Shipper Plans
  {
    id: "shipper-basic",
    name: "Shipper Basic",
    description: "Essential features for small to medium shippers",
    price: 29,
    currency: "USD",
    billingCycle: "monthly",
    userType: "shipper",
    features: [
      "Access to freight forwarder reviews",
      "Basic search and filtering",
      "Contact information for forwarders",
      "Email support"
    ]
  },
  {
    id: "shipper-premium",
    name: "Shipper Premium",
    description: "Advanced features for growing businesses",
    price: 79,
    currency: "USD",
    billingCycle: "monthly",
    userType: "shipper",
    isPopular: true,
    features: [
      "All Basic features",
      "Priority customer support",
      "Advanced analytics and reporting",
      "Custom alerts and notifications",
      "API access for integrations",
      "Dedicated account manager"
    ]
  },
  {
    id: "shipper-enterprise",
    name: "Shipper Enterprise",
    description: "Full-featured solution for large enterprises",
    price: 199,
    currency: "USD",
    billingCycle: "monthly",
    userType: "shipper",
    features: [
      "All Premium features",
      "White-label solutions",
      "Custom integrations",
      "24/7 phone support",
      "Advanced security features",
      "Multi-user management"
    ]
  },
  // Freight Forwarder Plans
  {
    id: "forwarder-basic",
    name: "Forwarder Basic",
    description: "Essential features for freight forwarders",
    price: 49,
    currency: "USD",
    billingCycle: "monthly",
    userType: "forwarder",
    features: [
      "Company profile listing",
      "Basic review management",
      "Customer inquiry responses",
      "Email support"
    ]
  },
  {
    id: "forwarder-premium",
    name: "Forwarder Premium",
    description: "Advanced features for established forwarders",
    price: 99,
    currency: "USD",
    billingCycle: "monthly",
    userType: "forwarder",
    isPopular: true,
    features: [
      "All Basic features",
      "Advanced analytics dashboard",
      "Review response automation",
      "Priority listing placement",
      "Marketing tools and insights",
      "Dedicated account manager"
    ]
  },
  {
    id: "forwarder-enterprise",
    name: "Forwarder Enterprise",
    description: "Complete solution for large forwarders",
    price: 299,
    currency: "USD",
    billingCycle: "monthly",
    userType: "forwarder",
    features: [
      "All Premium features",
      "Custom branding options",
      "Advanced API access",
      "24/7 phone support",
      "Multi-location management",
      "Advanced dispute resolution tools"
    ]
  }
];
function getPlansForUserType(userType) {
  return subscriptionPlans.filter((plan) => plan.userType === userType);
}
function SubscriptionModal($$payload, $$props) {
  push();
  let isOpen = fallback($$props["isOpen"], false);
  let selectedPlan = null;
  let authState = { user: null, token: null, isLoading: false, error: null };
  auth.subscribe((state) => {
    authState = state;
  });
  let availablePlans = [];
  async function loadPlansFromBackend() {
    if (!authState.user || !authState.token) return;
    try {
      const result = await apiClient.getSubscriptionPlans(authState.token);
      availablePlans = result.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billing_cycle,
        features: plan.features,
        userType: authState.user.user_type,
        isPopular: plan.is_popular || false
      }));
    } catch (error) {
      console.error("Failed to load plans from backend:", error);
      availablePlans = getPlansForUserType(authState.user.user_type);
    }
  }
  if (isOpen && authState.user && authState.token) {
    loadPlansFromBackend();
  }
  if (authState.user && !isOpen) {
    availablePlans = getPlansForUserType(authState.user.user_type);
  }
  if (
    // Check if user type matches plan type
    // Call the backend API to create subscription
    // Update the user's subscription tier in the auth store
    // Close modal after success
    isOpen
  ) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="modal-overlay svelte-pmf0sq"><div class="modal-content svelte-pmf0sq"><div class="modal-header svelte-pmf0sq"><h2 class="svelte-pmf0sq">Upgrade Your Subscription</h2> <button class="close-btn svelte-pmf0sq">×</button></div> <div class="modal-body svelte-pmf0sq">`);
    if (authState.user) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="user-info svelte-pmf0sq"><p class="svelte-pmf0sq">Welcome, <strong>${escape_html(authState.user.username)}</strong>!</p> <p class="svelte-pmf0sq">You are registered as a <strong>${escape_html(authState.user.user_type)}</strong>.</p></div> <div class="plans-container svelte-pmf0sq"><h3 class="svelte-pmf0sq">Available Plans for ${escape_html(authState.user.user_type)}s</h3> `);
      if (availablePlans.length > 0) {
        $$payload.out.push("<!--[-->");
        const each_array = ensure_array_like(availablePlans);
        $$payload.out.push(`<div class="plans-grid svelte-pmf0sq"><!--[-->`);
        for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
          let plan = each_array[$$index_1];
          const each_array_1 = ensure_array_like(plan.features);
          $$payload.out.push(`<div${attr_class("plan-card svelte-pmf0sq", void 0, { "selected": selectedPlan?.id === plan.id })}>`);
          if (plan.isPopular) {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`<div class="popular-badge svelte-pmf0sq">Most Popular</div>`);
          } else {
            $$payload.out.push("<!--[!-->");
          }
          $$payload.out.push(`<!--]--> <h4 class="plan-name svelte-pmf0sq">${escape_html(plan.name)}</h4> <div class="plan-price svelte-pmf0sq"><span class="currency svelte-pmf0sq">$</span> <span class="amount svelte-pmf0sq">${escape_html(plan.price)}</span> <span class="period svelte-pmf0sq">/month</span></div> <p class="plan-description svelte-pmf0sq">${escape_html(plan.description)}</p> <ul class="plan-features svelte-pmf0sq"><!--[-->`);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let feature = each_array_1[$$index];
            $$payload.out.push(`<li class="svelte-pmf0sq">${escape_html(feature)}</li>`);
          }
          $$payload.out.push(`<!--]--></ul></div>`);
        }
        $$payload.out.push(`<!--]--></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="no-plans svelte-pmf0sq">No plans available for your user type.</p>`);
      }
      $$payload.out.push(`<!--]--></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="login-required svelte-pmf0sq"><p>You must be logged in to view subscription plans.</p> <button class="btn-primary svelte-pmf0sq">Sign In</button></div>`);
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { isOpen });
  pop();
}
export {
  SubscriptionModal as S,
  getPlansForUserType as g
};
