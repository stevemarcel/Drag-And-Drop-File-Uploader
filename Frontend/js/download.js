// Logic: Config -> UI Selectors -> Expiry Calc -> Fetch Metadata -> UI State Switch -> Download Injection

// --- 1. CONFIGURATION & SELECTORS ---
const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get("id");

const loadingEl = document.getElementById("loading");
const contentEl = document.getElementById("content");
const errorEl = document.getElementById("error-message");
const titleEl = document.getElementById("display-title");
const linkEl = document.getElementById("download-link");
const timerEl = document.getElementById("expiry-timer");

// --- 2. HELPERS ---
/**
 * Calculates time remaining and returns text + status
 */
function calculateExpiry(date) {
  const diff = new Date(date).getTime() + 8 * 24 * 60 * 60 * 1000 - Date.now();

  if (diff <= 0) return { text: "Expired", isExpired: true };

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  let text = "";
  if (days > 0) {
    text = `Link expires in ${days}d ${hrs}h`;
  } else if (hrs > 0) {
    text = `Link expires in ${hrs}h ${mins}m`;
  } else {
    text = `Link expires in ${mins}m`;
  }

  return {
    text: text,
    isUrgent: days < 1,
    isExpired: false,
  };
}

/**
 * Switches the UI to the error/expired state
 */
function showError() {
  loadingEl.classList.add("hidden-state");
  contentEl.classList.add("hidden-state");
  if (errorEl) errorEl.classList.remove("hidden-state");
}

// --- 3. CORE DOWNLOAD LOGIC ---
async function fetchFileData() {
  // Check for ID presence
  if (!fileId) return showError();

  try {
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) throw new Error("File fetch failed");

    const data = await response.json();

    // 1. Calculate detailed expiry
    const expiry = calculateExpiry(data.createdAt);
    if (expiry.isExpired) return showError();

    // 2. Update text and timer
    titleEl.innerText = data.userTitle || "Project Assets";
    timerEl.innerText = expiry.text;

    // Pulse effect for less than 24 hours
    if (expiry.isUrgent) {
      timerEl.classList.add("urgent");
    }

    // 3. Cloudinary "Forced Download" Transformation
    const safeName = (data.userTitle || "assets").replace(/[^a-z0-9]/gi, "_").substring(0, 50);
    const downloadUrl = data.cloudinaryUrl.replace(
      "/upload/",
      `/upload/fl_attachment:${safeName}/`,
    );

    // 4. Update Button Attributes
    linkEl.href = downloadUrl;
    linkEl.target = "_blank";

    // 5. Final UI Transition
    loadingEl.classList.add("hidden-state");
    contentEl.classList.remove("hidden-state");
  } catch (err) {
    console.error("Download fetch error:", err);
    showError();
  }
}

// --- 4. START ---
fetchFileData();
