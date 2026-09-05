/**
 * authService.js
 * Mock authentication using localStorage.
 * Replace with Firebase/Supabase/custom API calls when backend is ready.
 */

const AuthService = (() => {
  const USERS_KEY = "soe_users";
  const SESSION_KEY = "soe_session";

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * signup(name, email, password)
   * Creates a new user account. Returns { success, user, error }.
   */
  function signup(name, email, password) {
    const users = getUsers();
    if (users[email]) {
      return { success: false, error: "An account with this email already exists." };
    }
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const user = {
      id: "user_" + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      // NOTE: In production, NEVER store plain-text passwords.
      // Use a hashed password via bcrypt + server-side auth.
      passwordHash: btoa(password), // Base64 encode — demo only
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
    };

    users[email] = user;
    saveUsers(users);
    setSession({ id: user.id, name: user.name, email: user.email });
    return { success: true, user };
  }

  /**
   * login(email, password)
   * Authenticates a user. Returns { success, user, error }.
   */
  function login(email, password) {
    const users = getUsers();
    const user = users[email?.toLowerCase()?.trim()];
    if (!user) {
      return { success: false, error: "No account found with this email." };
    }
    if (user.passwordHash !== btoa(password)) {
      return { success: false, error: "Incorrect password." };
    }
    setSession({ id: user.id, name: user.name, email: user.email });
    return { success: true, user };
  }

  /**
   * loginAsDemo(profileKey)
   * Logs in with a pre-built demo profile without password.
   * profileKey: 'demo-ai' | 'demo-web' | 'demo-cyber' | 'demo-design'
   */
  function loginAsDemo(profileKey = "demo-ai") {
    const profile = DEMO_PROFILES[profileKey];
    if (!profile) return { success: false, error: "Unknown demo profile." };

    // Inject demo profile into userService storage
    UserService.saveProfile(profile.id, profile);

    setSession({ id: profile.id, name: profile.name, email: profile.email, isDemo: true });

    // Mark onboarding complete for demo
    const users = getUsers();
    users[profile.email] = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      passwordHash: "",
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
    };
    saveUsers(users);

    return { success: true, user: profile };
  }

  /**
   * logout()
   */
  function logout() {
    clearSession();
    window.location.href = "index.html";
  }

  /**
   * getCurrentUser()
   * Returns the currently logged-in session user, or null.
   */
  function getCurrentUser() {
    return getSession();
  }

  /**
   * isLoggedIn()
   */
  function isLoggedIn() {
    return !!getSession();
  }

  /**
   * requireAuth(redirectTo)
   * Redirects to auth page if not logged in.
   */
  function requireAuth(redirectTo = "auth.html") {
    if (!isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  /**
   * markOnboardingComplete(userId)
   */
  function markOnboardingComplete(email) {
    const users = getUsers();
    if (users[email]) {
      users[email].onboardingComplete = true;
      saveUsers(users);
    }
  }

  /**
   * isOnboardingComplete(email)
   */
  function isOnboardingComplete(email) {
    const users = getUsers();
    return !!users[email]?.onboardingComplete;
  }

  return {
    signup,
    login,
    loginAsDemo,
    logout,
    getCurrentUser,
    isLoggedIn,
    requireAuth,
    markOnboardingComplete,
    isOnboardingComplete,
  };
})();
