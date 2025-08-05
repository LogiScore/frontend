import { u as push, y as escape_html, z as attr, G as maybe_selected, F as bind_props, w as pop } from "./index.js";
import "./auth.js";
import { k as fallback } from "./equality.js";
function AuthModal($$payload, $$props) {
  push();
  let isOpen = fallback($$props["isOpen"], false);
  let defaultMode = fallback($$props["defaultMode"], "signin");
  let mode = defaultMode;
  let isLoading = false;
  let signinData = { email: "", password: "" };
  let signupData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    userType: "shipper"
  };
  mode = defaultMode;
  if (isOpen) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="modal-overlay svelte-1e42tya"><div class="modal-content svelte-1e42tya"><button class="close-button svelte-1e42tya">×</button> <div class="auth-container svelte-1e42tya"><h2 class="svelte-1e42tya">${escape_html(mode === "signin" ? "Sign In" : "Create Account")}</h2> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (mode === "signin") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<form class="auth-form svelte-1e42tya"><div class="form-group svelte-1e42tya"><label for="signin-email" class="svelte-1e42tya">Email</label> <input type="email" id="signin-email"${attr("value", signinData.email)} required placeholder="Enter your email" class="svelte-1e42tya"/></div> <div class="form-group svelte-1e42tya"><label for="signin-password" class="svelte-1e42tya">Password</label> <input type="password" id="signin-password"${attr("value", signinData.password)} required placeholder="Enter your password" class="svelte-1e42tya"/></div> <button type="submit" class="btn-primary svelte-1e42tya"${attr("disabled", isLoading, true)}>${escape_html("Sign In")}</button></form>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<form class="auth-form svelte-1e42tya"><div class="form-group svelte-1e42tya"><label for="signup-name" class="svelte-1e42tya">Full Name *</label> <input type="text" id="signup-name"${attr("value", signupData.name)} required placeholder="Enter your full name" class="svelte-1e42tya"/></div> <div class="form-group svelte-1e42tya"><label for="signup-email" class="svelte-1e42tya">Email *</label> <input type="email" id="signup-email"${attr("value", signupData.email)} required placeholder="Enter your email" class="svelte-1e42tya"/></div> <div class="form-group svelte-1e42tya"><label for="signup-company" class="svelte-1e42tya">Company (Optional)</label> <input type="text" id="signup-company"${attr("value", signupData.company)} placeholder="Enter your company name" class="svelte-1e42tya"/></div> <div class="form-group svelte-1e42tya"><label for="signup-user-type" class="svelte-1e42tya">I am a *</label> <select id="signup-user-type" required class="svelte-1e42tya">`);
      $$payload.select_value = signupData.userType;
      $$payload.out.push(`<option value="shipper"${maybe_selected($$payload, "shipper")}>Shipper (I need freight forwarding services)</option><option value="forwarder"${maybe_selected($$payload, "forwarder")}>Freight Forwarder (I provide freight forwarding services)</option>`);
      $$payload.select_value = void 0;
      $$payload.out.push(`</select></div> <div class="form-group svelte-1e42tya"><label for="signup-password" class="svelte-1e42tya">Password *</label> <input type="password" id="signup-password"${attr("value", signupData.password)} required placeholder="Create a password" class="svelte-1e42tya"/></div> <div class="form-group svelte-1e42tya"><label for="signup-confirm-password" class="svelte-1e42tya">Confirm Password *</label> <input type="password" id="signup-confirm-password"${attr("value", signupData.confirmPassword)} required placeholder="Confirm your password" class="svelte-1e42tya"/></div> <button type="submit" class="btn-primary svelte-1e42tya"${attr("disabled", isLoading, true)}>${escape_html("Create Account")}</button></form>`);
    }
    $$payload.out.push(`<!--]--> <div class="auth-footer svelte-1e42tya"><p class="svelte-1e42tya">${escape_html(mode === "signin" ? "Don't have an account?" : "Already have an account?")} <button class="link-button svelte-1e42tya">${escape_html(mode === "signin" ? "Sign Up" : "Sign In")}</button></p></div></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { isOpen, defaultMode });
  pop();
}
export {
  AuthModal as A
};
