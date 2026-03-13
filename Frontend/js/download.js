const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get("id");

const loadingEl = document.getElementById("loading");
const contentEl = document.getElementById("content");
const errorEl = document.getElementById("error-message");
const titleEl = document.getElementById("display-title");
const linkEl = document.getElementById("download-link");

/**
 * Main function to fetch file metadata and prepare the download button.
 */
async function fetchFileData() {
  // 1. Validation: If no ID in the URL, show error
  if (!fileId) {
    showError();
    return;
  }

  try {
    // 2. Fetch data from the backend API
    const response = await fetch(`/api/files/${fileId}`);

    if (!response.ok) {
      throw new Error("File not found or server error");
    }

    const data = await response.json();

    // Calculate Days Remaining
    const uploadDate = new Date(data.createdAt);
    const expiryDate = new Date(uploadDate);
    expiryDate.setDate(uploadDate.getDate() + 8); // Add 8 days to upload date

    const today = new Date();
    // Calculate difference in milliseconds and convert to days
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Update the footer text
    const footerNote = document.querySelector(".footer-note");
    if (diffDays > 0) {
      footerNote.innerHTML = `
        Need help? <a href="mailto:sharkcoloursng@gmail.com" class="text-pry">Contact Support</a><br />
        Link expires in ${diffDays} ${diffDays === 1 ? "day" : "days"}.
    `;
    } else {
      showError();
    }

    // 3. UI Transition: Hide loader, show content
    loadingEl.classList.add("hidden-state");
    contentEl.classList.remove("hidden-state");
    contentEl.style.display = "block"; // Force block display to override potential CSS conflicts

    // 4. Populate Page Content
    titleEl.innerText = data.userTitle || "Project Assets";

    // 5. Cloudinary "Forced Download" Logic
    // Inject 'fl_attachment' into the URL path.Tells Cloudinary to send the 'Content-Disposition: attachment' header.
    const originalUrl = data.cloudinaryUrl;
    const safeName = (data.userTitle || "assets").replace(/[^a-z0-9]/gi, "_").substring(0, 50);
    const downloadUrl = originalUrl.replace("/upload/", `/upload/fl_attachment:${safeName}/`);

    // 6. Update Button Attributes
    linkEl.href = downloadUrl;

    // Fallback: File naming
    linkEl.setAttribute("download", safeName);

    // Open in a new tab
    linkEl.target = "_blank";
  } catch (err) {
    console.error("Download Error:", err);
    showError();
  }
}

/**
 * Switches the UI to the error/expired state.
 */
function showError() {
  loadingEl.classList.add("hidden-state");
  contentEl.classList.add("hidden-state");

  // Ensure the error element is visible
  if (errorEl) {
    errorEl.classList.remove("hidden-state");
    errorEl.style.display = "block";
  }
}

// Initialize the fetch
fetchFileData();
