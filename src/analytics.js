// Analytics Utility for KiranaGoLive Launch Page
// This helps you review user interactions with the launch page

/**
 * Get all app launch events
 * @returns {Array} Array of launch events
 */
export function getAppLaunches() {
  try {
    const launches = localStorage.getItem("appLaunches");
    return launches ? JSON.parse(launches) : [];
  } catch (e) {
    console.error("Error reading launches:", e);
    return [];
  }
}

/**
 * Get launch statistics
 * @returns {Object} Statistics about app launches
 */
export function getLaunchStats() {
  const launches = getAppLaunches();

  const stats = {
    total: launches.length,
    lastLaunch: launches.length > 0 ? launches[launches.length - 1].timestamp : null,
  };

  return stats;
}

/**
 * Export launch data as CSV
 * @returns {string} CSV formatted data
 */
export function exportToCSV() {
  const launches = getAppLaunches();
  if (launches.length === 0) return "No data available";

  const headers = ["Source", "Timestamp", "Date", "Time"];
  const rows = launches.map(launch => {
    const date = new Date(launch.timestamp);
    return [
      launch.source,
      launch.timestamp,
      date.toLocaleDateString(),
      date.toLocaleTimeString()
    ];
  });

  return [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
}

/**
 * Clear all tracking data
 */
export function clearTrackingData() {
  localStorage.removeItem("appLaunches");
  console.log("Tracking data cleared");
}

/**
 * Download analytics data as CSV file
 */
export function downloadAnalytics() {
  const csv = exportToCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kiranagolive-analytics-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Console helpers for quick access
window.kiranaAnalytics = {
  getLaunches: getAppLaunches,
  getStats: getLaunchStats,
  exportCSV: exportToCSV,
  download: downloadAnalytics,
  clear: clearTrackingData
};

console.log("📊 Analytics utilities loaded! Use window.kiranaAnalytics in console");
console.log("Available commands:");
console.log("  - window.kiranaAnalytics.getStats() - View statistics");
console.log("  - window.kiranaAnalytics.getLaunches() - View all launches");
console.log("  - window.kiranaAnalytics.download() - Download CSV report");
console.log("  - window.kiranaAnalytics.clear() - Clear all data");
