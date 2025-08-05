import { u as push, z as attr, y as escape_html, F as bind_props, w as pop, G as maybe_selected, J as copy_payload, K as assign_payload, N as ensure_array_like, O as head, P as attr_class, Q as stringify } from "../../chunks/index.js";
import { a as auth } from "../../chunks/auth.js";
import { A as AuthModal } from "../../chunks/AuthModal.js";
import { k as fallback } from "../../chunks/equality.js";
import { S as SubscriptionModal } from "../../chunks/SubscriptionModal.js";
function ChangePasswordModal($$payload, $$props) {
  push();
  let isOpen = fallback($$props["isOpen"], false);
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let isLoading = false;
  auth.subscribe((state) => {
  });
  if (isOpen) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="modal-overlay svelte-1ngo5n8"><div class="modal-content svelte-1ngo5n8"><div class="modal-header svelte-1ngo5n8"><h2 class="svelte-1ngo5n8">Change Password</h2> <button class="close-btn svelte-1ngo5n8">×</button></div> <form class="modal-body svelte-1ngo5n8"><div class="form-group svelte-1ngo5n8"><label for="current-password" class="svelte-1ngo5n8">Current Password</label> <input type="password" id="current-password"${attr("value", currentPassword)} required${attr("disabled", isLoading, true)} class="svelte-1ngo5n8"/></div> <div class="form-group svelte-1ngo5n8"><label for="new-password" class="svelte-1ngo5n8">New Password</label> <input type="password" id="new-password"${attr("value", newPassword)} required${attr("disabled", isLoading, true)} minlength="6" class="svelte-1ngo5n8"/></div> <div class="form-group svelte-1ngo5n8"><label for="confirm-password" class="svelte-1ngo5n8">Confirm New Password</label> <input type="password" id="confirm-password"${attr("value", confirmPassword)} required${attr("disabled", isLoading, true)} minlength="6" class="svelte-1ngo5n8"/></div> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <div class="modal-footer svelte-1ngo5n8"><button type="button" class="btn-secondary svelte-1ngo5n8"${attr("disabled", isLoading, true)}>Cancel</button> <button type="submit" class="btn-primary svelte-1ngo5n8"${attr("disabled", isLoading, true)}>${escape_html("Change Password")}</button></div></form></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { isOpen });
  pop();
}
function ProfileModal($$payload, $$props) {
  push();
  let isOpen = fallback($$props["isOpen"], false);
  let isLoading = false;
  let formData = {
    full_name: "",
    email: "",
    company_name: "",
    user_type: "shipper"
  };
  auth.subscribe((state) => {
    if (state.user) {
      formData = {
        full_name: state.user.full_name || state.user.username || "",
        email: state.user.email || "",
        company_name: state.user.company_name || "",
        user_type: state.user.user_type || "shipper"
      };
    }
  });
  if (isOpen) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="modal-overlay svelte-1oojr62"><div class="modal-content svelte-1oojr62"><div class="modal-header svelte-1oojr62"><h2 class="svelte-1oojr62">Edit Profile</h2> <button class="close-btn svelte-1oojr62">×</button></div> <div class="modal-body svelte-1oojr62"><form><div class="form-group svelte-1oojr62"><label for="full_name" class="svelte-1oojr62">Full Name</label> <input type="text" id="full_name"${attr("value", formData.full_name)} placeholder="Enter your full name" required class="svelte-1oojr62"/></div> <div class="form-group svelte-1oojr62"><label for="email" class="svelte-1oojr62">Email</label> <input type="email" id="email"${attr("value", formData.email)} placeholder="Enter your email" required class="svelte-1oojr62"/></div> <div class="form-group svelte-1oojr62"><label for="company_name" class="svelte-1oojr62">Company Name</label> <input type="text" id="company_name"${attr("value", formData.company_name)} placeholder="Enter your company name (optional)" class="svelte-1oojr62"/></div> <div class="form-group svelte-1oojr62"><label for="user_type" class="svelte-1oojr62">User Type</label> <select id="user_type" class="svelte-1oojr62">`);
    $$payload.select_value = formData.user_type;
    $$payload.out.push(`<option value="shipper"${maybe_selected($$payload, "shipper")}>Shipper</option><option value="forwarder"${maybe_selected($$payload, "forwarder")}>Freight Forwarder</option>`);
    $$payload.select_value = void 0;
    $$payload.out.push(`</select></div> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <div class="form-actions svelte-1oojr62"><button type="button" class="btn-secondary svelte-1oojr62"${attr("disabled", isLoading, true)}>Cancel</button> <button type="submit" class="btn-primary svelte-1oojr62"${attr("disabled", isLoading, true)}>${escape_html("Update Profile")}</button></div></form></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { isOpen });
  pop();
}
function _page($$payload, $$props) {
  push();
  let searchQuery = "";
  let showAuthModal = false;
  let authModalMode = "signin";
  let showChangePasswordModal = false;
  let showSubscriptionModal = false;
  let showUserDropdown = false;
  let showProfileModal = false;
  let featuredCompanies = [
    {
      name: "DHL Supply Chain",
      rating: 4.8,
      reviews: 156,
      logo: "https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg",
      description: "Global logistics leader with comprehensive supply chain solutions"
    },
    {
      name: "Kuehne + Nagel",
      rating: 4.7,
      reviews: 142,
      logo: "https://www.kuehne-nagel.com/-/media/kn/website/header/logo.svg",
      description: "International logistics company with extensive global network"
    },
    {
      name: "DB Schenker",
      rating: 4.6,
      reviews: 128,
      logo: "https://www.dbschenker.com/logo.svg",
      description: "Reliable global logistics provider with innovative solutions"
    }
  ];
  let testimonials = [
    {
      name: "Sarah Chen",
      company: "Global Imports Ltd",
      text: "LogiScore helped us find a reliable freight forwarder that saved us 30% on shipping costs. The reviews were spot-on!",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      company: "TechExports Inc",
      text: "Finally, a platform that gives us real insights into freight forwarders. The detailed reviews helped us make the right choice.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      company: "European Logistics",
      text: "As a freight forwarder, LogiScore has helped us showcase our strengths and improve our services based on customer feedback.",
      rating: 5
    }
  ];
  let authState = { user: null };
  auth.subscribe((state) => {
    authState = state;
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(featuredCompanies);
    const each_array_2 = ensure_array_like(testimonials);
    head($$payload2, ($$payload3) => {
      $$payload3.title = `<title>LogiScore - Find and Review Freight Forwarders</title>`;
      $$payload3.out.push(`<meta name="description" content="Discover, compare, and review freight forwarders worldwide. Make informed decisions with real user ratings and detailed reviews." class="svelte-1bk0en3"/> <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&amp;display=swap" rel="stylesheet" class="svelte-1bk0en3"/>`);
    });
    $$payload2.out.push(`<header class="header svelte-1bk0en3"><div class="container svelte-1bk0en3"><nav class="nav svelte-1bk0en3"><div class="nav-brand svelte-1bk0en3"><div class="logo-container svelte-1bk0en3"><img src="/logo.png" alt="LogiScore" class="logo svelte-1bk0en3"/></div></div> <div class="nav-menu svelte-1bk0en3"><a href="/search" class="nav-link svelte-1bk0en3">Search</a> <a href="/about" class="nav-link svelte-1bk0en3">About</a> <a href="/how-it-works" class="nav-link svelte-1bk0en3">How It Works</a> <a href="/pricing" class="nav-link svelte-1bk0en3">Pricing</a> <a href="/help" class="nav-link svelte-1bk0en3">Help</a> <a href="/contact" class="nav-link svelte-1bk0en3">Contact</a></div> <div class="nav-actions svelte-1bk0en3">`);
    if (authState.user) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div${attr_class("user-dropdown svelte-1bk0en3", void 0, { "open": showUserDropdown })}><button class="user-dropdown-toggle svelte-1bk0en3"><span class="username svelte-1bk0en3">${escape_html(authState.user.username)}</span> <span${attr_class("status-badge svelte-1bk0en3", void 0, { "premium": authState.user.subscription_tier !== "free" })}>${escape_html(authState.user.subscription_tier === "free" ? "Free" : authState.user.subscription_tier)}</span> <svg class="dropdown-arrow svelte-1bk0en3" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9" class="svelte-1bk0en3"></polyline></svg></button> <div class="user-dropdown-menu svelte-1bk0en3"><div class="dropdown-header svelte-1bk0en3"><div class="user-info svelte-1bk0en3"><span class="user-name svelte-1bk0en3">${escape_html(authState.user.full_name || authState.user.username)}</span> <span class="user-email svelte-1bk0en3">${escape_html(authState.user.email)}</span></div> <div class="subscription-info svelte-1bk0en3"><span class="subscription-label svelte-1bk0en3">Plan:</span> <span${attr_class("subscription-value svelte-1bk0en3", void 0, { "premium": authState.user.subscription_tier !== "free" })}>${escape_html(authState.user.subscription_tier === "free" ? "Free Plan" : authState.user.subscription_tier)}</span></div></div> <div class="dropdown-actions svelte-1bk0en3"><button class="dropdown-item svelte-1bk0en3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1bk0en3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" class="svelte-1bk0en3"></path><circle cx="12" cy="7" r="4" class="svelte-1bk0en3"></circle></svg> View Profile</button> <button class="dropdown-item svelte-1bk0en3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1bk0en3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" class="svelte-1bk0en3"></path></svg> Upgrade Subscription</button> <button class="dropdown-item svelte-1bk0en3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1bk0en3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" class="svelte-1bk0en3"></rect><circle cx="12" cy="16" r="1" class="svelte-1bk0en3"></circle><path d="M7 11V7a5 5 0 0 1 10 0v4" class="svelte-1bk0en3"></path></svg> Change Password</button> <div class="dropdown-divider svelte-1bk0en3"></div> <button class="dropdown-item logout svelte-1bk0en3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1bk0en3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" class="svelte-1bk0en3"></path><polyline points="16,17 21,12 16,7" class="svelte-1bk0en3"></polyline><line x1="21" y1="12" x2="9" y2="12" class="svelte-1bk0en3"></line></svg> Sign Out</button></div></div></div>`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<button class="btn-secondary svelte-1bk0en3">Sign In</button> <button class="btn-primary svelte-1bk0en3">Sign Up</button>`);
    }
    $$payload2.out.push(`<!--]--></div></nav></div></header> <section class="hero svelte-1bk0en3"><div class="container svelte-1bk0en3"><div class="hero-content svelte-1bk0en3"><h1 class="hero-title svelte-1bk0en3">Find the Perfect <span class="highlight svelte-1bk0en3">Freight Forwarder</span></h1> <p class="hero-subtitle svelte-1bk0en3">Discover, compare, and review freight forwarders worldwide. 
        Make informed decisions with real user ratings and detailed reviews.</p> <div class="search-container svelte-1bk0en3"><div class="search-box svelte-1bk0en3"><input type="text" placeholder="Search freight forwarders, companies, or locations..."${attr("value", searchQuery)} class="search-input svelte-1bk0en3"/> <button class="search-button svelte-1bk0en3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="svelte-1bk0en3"><circle cx="11" cy="11" r="8" class="svelte-1bk0en3"></circle><path d="m21 21-4.35-4.35" class="svelte-1bk0en3"></path></svg></button></div></div> <div class="hero-stats svelte-1bk0en3"><div class="stat svelte-1bk0en3"><span class="stat-number svelte-1bk0en3">500+</span> <span class="stat-label svelte-1bk0en3">Companies</span></div> <div class="stat svelte-1bk0en3"><span class="stat-number svelte-1bk0en3">10K+</span> <span class="stat-label svelte-1bk0en3">Reviews</span></div> <div class="stat svelte-1bk0en3"><span class="stat-number svelte-1bk0en3">50+</span> <span class="stat-label svelte-1bk0en3">Countries</span></div></div></div></div></section> <section class="ad-space svelte-1bk0en3"><div class="container svelte-1bk0en3"><div class="ad-banner svelte-1bk0en3"><div class="ad-content svelte-1bk0en3"><h3 class="svelte-1bk0en3">Premium Freight Forwarder Spotlight</h3> <p class="svelte-1bk0en3">Featured placement for top-rated logistics companies</p></div> <div class="ad-cta svelte-1bk0en3"><button class="ad-button svelte-1bk0en3">Learn More</button></div></div></div></section> <section class="featured svelte-1bk0en3"><div class="container svelte-1bk0en3"><h2 class="section-title svelte-1bk0en3">Top Rated Freight Forwarders</h2> <div class="companies-grid svelte-1bk0en3"><!--[-->`);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let company = each_array[$$index_1];
      const each_array_1 = ensure_array_like(Array(5));
      $$payload2.out.push(`<div class="company-card svelte-1bk0en3"><div class="company-header svelte-1bk0en3"><div class="company-logo svelte-1bk0en3"><img${attr("src", company.logo)}${attr("alt", `${stringify(company.name)} logo`)} class="svelte-1bk0en3"/></div> <div class="company-info svelte-1bk0en3"><h3 class="company-name svelte-1bk0en3">${escape_html(company.name)}</h3> <div class="company-rating svelte-1bk0en3"><div class="stars svelte-1bk0en3"><!--[-->`);
      for (let i = 0, $$length2 = each_array_1.length; i < $$length2; i++) {
        each_array_1[i];
        $$payload2.out.push(`<span${attr_class(`star ${stringify(i < Math.floor(company.rating) ? "filled" : "")}`, "svelte-1bk0en3")}>★</span>`);
      }
      $$payload2.out.push(`<!--]--></div> <span class="rating-text svelte-1bk0en3">${escape_html(company.rating)} (${escape_html(company.reviews)} reviews)</span></div></div></div> <p class="company-description svelte-1bk0en3">${escape_html(company.description)}</p> <button class="view-details-btn svelte-1bk0en3">View Details</button></div>`);
    }
    $$payload2.out.push(`<!--]--></div></div></section> <section class="ad-space svelte-1bk0en3"><div class="container svelte-1bk0en3"><div class="ad-banner svelte-1bk0en3"><div class="ad-content svelte-1bk0en3"><h3 class="svelte-1bk0en3">Get Your Company Featured</h3> <p class="svelte-1bk0en3">Boost your visibility with premium placement and enhanced profiles</p></div> <div class="ad-cta svelte-1bk0en3"><button class="ad-button svelte-1bk0en3">Contact Sales</button></div></div></div></section> <section class="how-it-works svelte-1bk0en3"><div class="container svelte-1bk0en3"><h2 class="section-title svelte-1bk0en3">How LogiScore Works</h2> <div class="steps-grid svelte-1bk0en3"><div class="step svelte-1bk0en3"><div class="step-number svelte-1bk0en3">1</div> <h3 class="svelte-1bk0en3">Search &amp; Discover</h3> <p class="svelte-1bk0en3">Find freight forwarders by name, location, or service type. Browse detailed company profiles and ratings.</p></div> <div class="step svelte-1bk0en3"><div class="step-number svelte-1bk0en3">2</div> <h3 class="svelte-1bk0en3">Compare &amp; Evaluate</h3> <p class="svelte-1bk0en3">Compare companies side-by-side. Read detailed reviews and ratings from real customers.</p></div> <div class="step svelte-1bk0en3"><div class="step-number svelte-1bk0en3">3</div> <h3 class="svelte-1bk0en3">Review &amp; Share</h3> <p class="svelte-1bk0en3">Share your experience by leaving reviews and ratings. Help others make informed decisions.</p></div></div></div></section> <section class="testimonials svelte-1bk0en3"><div class="container svelte-1bk0en3"><h2 class="section-title svelte-1bk0en3">What Our Users Say</h2> <div class="testimonials-grid svelte-1bk0en3"><!--[-->`);
    for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
      let testimonial = each_array_2[$$index_3];
      const each_array_3 = ensure_array_like(Array(5));
      $$payload2.out.push(`<div class="testimonial-card svelte-1bk0en3"><div class="testimonial-stars svelte-1bk0en3"><!--[-->`);
      for (let i = 0, $$length2 = each_array_3.length; i < $$length2; i++) {
        each_array_3[i];
        $$payload2.out.push(`<span${attr_class(`star ${stringify(i < testimonial.rating ? "filled" : "")}`, "svelte-1bk0en3")}>★</span>`);
      }
      $$payload2.out.push(`<!--]--></div> <p class="testimonial-text svelte-1bk0en3">"${escape_html(testimonial.text)}"</p> <div class="testimonial-author svelte-1bk0en3"><strong class="svelte-1bk0en3">${escape_html(testimonial.name)}</strong> <span class="testimonial-company svelte-1bk0en3">${escape_html(testimonial.company)}</span></div></div>`);
    }
    $$payload2.out.push(`<!--]--></div></div></section> <section class="ad-space svelte-1bk0en3"><div class="container svelte-1bk0en3"><div class="ad-banner svelte-1bk0en3"><div class="ad-content svelte-1bk0en3"><h3 class="svelte-1bk0en3">Pro Plan Benefits</h3> <p class="svelte-1bk0en3">Unlock detailed analytics, custom reports, and priority support</p></div> <div class="ad-cta svelte-1bk0en3"><button class="ad-button svelte-1bk0en3">Upgrade Now</button></div></div></div></section> <section class="cta svelte-1bk0en3"><div class="container svelte-1bk0en3"><div class="cta-content svelte-1bk0en3"><h2 class="svelte-1bk0en3">Ready to Find Your Perfect Freight Forwarder?</h2> <p class="svelte-1bk0en3">Join thousands of businesses making informed logistics decisions.</p> <div class="cta-buttons svelte-1bk0en3"><button class="btn-primary svelte-1bk0en3">Start Searching</button> <button class="btn-secondary svelte-1bk0en3">Write a Review</button></div></div></div></section> <footer class="footer svelte-1bk0en3"><div class="container svelte-1bk0en3"><div class="footer-content svelte-1bk0en3"><div class="footer-section svelte-1bk0en3"><h3 class="svelte-1bk0en3">Company</h3> <ul class="svelte-1bk0en3"><li class="svelte-1bk0en3"><a href="/about" class="svelte-1bk0en3">About</a></li> <li class="svelte-1bk0en3"><a href="/careers" class="svelte-1bk0en3">Careers</a></li> <li class="svelte-1bk0en3"><a href="/press" class="svelte-1bk0en3">Press</a></li> <li class="svelte-1bk0en3"><a href="/contact" class="svelte-1bk0en3">Contact</a></li></ul></div> <div class="footer-section svelte-1bk0en3"><h3 class="svelte-1bk0en3">Platform</h3> <ul class="svelte-1bk0en3"><li class="svelte-1bk0en3"><a href="/how-it-works" class="svelte-1bk0en3">How It Works</a></li> <li class="svelte-1bk0en3"><a href="/pricing" class="svelte-1bk0en3">Pricing</a></li> <li class="svelte-1bk0en3"><a href="/features" class="svelte-1bk0en3">Features</a></li> <li class="svelte-1bk0en3"><a href="/api" class="svelte-1bk0en3">API</a></li></ul></div> <div class="footer-section svelte-1bk0en3"><h3 class="svelte-1bk0en3">Support</h3> <ul class="svelte-1bk0en3"><li class="svelte-1bk0en3"><a href="/help" class="svelte-1bk0en3">Help Center</a></li> <li class="svelte-1bk0en3"><a href="/faq" class="svelte-1bk0en3">FAQ</a></li> <li class="svelte-1bk0en3"><a href="/guidelines" class="svelte-1bk0en3">Guidelines</a></li> <li class="svelte-1bk0en3"><a href="/contact-support" class="svelte-1bk0en3">Contact Support</a></li></ul></div> <div class="footer-section svelte-1bk0en3"><h3 class="svelte-1bk0en3">Legal</h3> <ul class="svelte-1bk0en3"><li class="svelte-1bk0en3"><a href="/privacy" class="svelte-1bk0en3">Privacy Policy</a></li> <li class="svelte-1bk0en3"><a href="/terms" class="svelte-1bk0en3">Terms of Service</a></li> <li class="svelte-1bk0en3"><a href="/cookies" class="svelte-1bk0en3">Cookie Policy</a></li> <li class="svelte-1bk0en3"><a href="/security" class="svelte-1bk0en3">Security</a></li></ul></div></div> <div class="footer-bottom svelte-1bk0en3"><p class="svelte-1bk0en3">© 2025 LogiScore. All rights reserved.</p></div></div></footer>  `);
    AuthModal($$payload2, {
      defaultMode: authModalMode,
      get isOpen() {
        return showAuthModal;
      },
      set isOpen($$value) {
        showAuthModal = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> `);
    ChangePasswordModal($$payload2, {
      get isOpen() {
        return showChangePasswordModal;
      },
      set isOpen($$value) {
        showChangePasswordModal = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> `);
    SubscriptionModal($$payload2, {
      get isOpen() {
        return showSubscriptionModal;
      },
      set isOpen($$value) {
        showSubscriptionModal = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> `);
    ProfileModal($$payload2, {
      get isOpen() {
        return showProfileModal;
      },
      set isOpen($$value) {
        showProfileModal = $$value;
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
