// Configuration Management for KiranaGoLive Launch Page
// Stores and retrieves configurable settings from Firebase Firestore.

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const CONFIG_KEY = "kiranaGoLiveConfig";

const firebaseConfig = {
  apiKey: "AIzaSyCvI8r9KlNFxjRnfgXiaW1wgFq9BHyzGPQ",
  authDomain: "chat-project-test-dc269.firebaseapp.com",
  projectId: "chat-project-test-dc269",
  storageBucket: "chat-project-test-dc269.firebasestorage.app",
  messagingSenderId: "251771322300",
  appId: "1:251771322300:web:b1ac06f4711e77d00375b9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const CONFIG_DOC = doc(db, "appConfig", "default");

// Default configuration
const DEFAULT_CONFIG = {
  appName: "Outlet AI",
  appSubtitle: "Your store's billing, stock, and accounts in one app.",
  playStoreUrl: "https://play.google.com/store/apps/details?id=ai.perplexity.app.android&pcampaignid=web_share",
  backendUrl: "",
  goLiveToken: "",
  lastSignaledAt: null,
  lastUpdated: new Date().toISOString(),
};

/**
 * Get current configuration
 * @returns {Object} Current configuration
 */
export async function getConfig() {
  const stored = localStorage.getItem(CONFIG_KEY);
  let config = DEFAULT_CONFIG;

  if (stored) {
    try {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch (e) {
      console.error("Error parsing local config:", e);
    }
  }

  try {
    const snapshot = await getDoc(CONFIG_DOC);
    if (snapshot.exists()) {
      const apiConfig = snapshot.data();
      config = { ...DEFAULT_CONFIG, ...config, ...apiConfig };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.warn("Could not fetch config from Firebase, using local/default config.", e);
  }

  return config;
}

/**
 * Update configuration
 * @param {Object} newConfig - Configuration updates
 */
export async function updateConfig(newConfig) {
  const current = await getConfig();
  const updated = {
    ...current,
    ...newConfig,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));

  try {
    await setDoc(CONFIG_DOC, updated, { merge: true });
  } catch (e) {
    console.warn("Failed to save config to Firebase, saved locally only.", e);
  }

  return updated;
}

/**
 * Reset to default configuration
 */
export async function resetConfig() {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  try {
    await setDoc(CONFIG_DOC, DEFAULT_CONFIG, { merge: true });
  } catch (e) {
    console.warn("Failed to reset config in Firebase, reset locally only.", e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Export configuration as JSON
 */
export async function exportConfig() {
  return JSON.stringify(await getConfig(), null, 2);
}

/**
 * Import configuration from JSON
 * @param {string} jsonString - JSON configuration
 */
export async function importConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    await updateConfig(config);
    return { success: true, config };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Make config available globally for debugging
window.kiranaConfig = {
  get: getConfig,
  update: updateConfig,
  reset: resetConfig,
  export: exportConfig,
  import: importConfig,
};
