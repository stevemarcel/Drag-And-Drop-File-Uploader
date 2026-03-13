const form = document.querySelector("#upload-form");
const fileInput = document.querySelector("#file-input");
const titleInput = document.querySelector("#file-title");
const progressArea = document.querySelector(".progress-area");
const uploadArea = document.querySelector(".upload-area");

const loginForm = document.getElementById("loginForm");
const authInput = document.getElementById("authInput");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

const urlParams = new URLSearchParams(window.location.search);
const authKey = urlParams.get("auth");

// State Templates
const successTemplate = document.getElementById("success-template");
const errorTemplate = document.getElementById("error-template");

// Cloudinary CONFIG
const CLOUD_NAME = "dphlb0nsu";
const UPLOAD_PRESET = "client_side_shark_upload";

// 1. Authentication Logic
// Toggle logic
togglePassword.addEventListener("click", () => {
  const type = authInput.getAttribute("type") === "password" ? "text" : "password";
  authInput.setAttribute("type", type);

  // Toggle icon classes
  eyeIcon.classList.toggle("fa-eye");
  eyeIcon.classList.toggle("fa-eye-slash");
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const key = document.getElementById("authInput").value;
  // Redirects current page to include the auth query
  window.location.href =
    window.location.origin + window.location.pathname + "?auth=" + encodeURIComponent(key);
});

// 2. Trigger File Selection
form.addEventListener("click", () => fileInput.click());

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 18) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 15) + "... ." + splitName[1];
    }
    uploadFile(file, fileName);
  }
};

// 3. Drag and Drop Logic
let dragCounter = 0;
form.addEventListener("dragenter", (e) => {
  e.preventDefault();
  dragCounter++;
  form.classList.add("form-hover");
});

form.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) form.classList.remove("form-hover");
});

form.addEventListener("dragover", (e) => e.preventDefault());

form.addEventListener("drop", (e) => {
  e.preventDefault();
  dragCounter = 0;
  form.classList.remove("form-hover");
  let file = e.dataTransfer.files[0];
  if (file) uploadFile(file, file.name);
});

// 4. Upload Logic
async function uploadFile(file, name) {
  const userTitle = titleInput.value.trim() || file.name;
  const folderName = userTitle.replace(/[^a-z0-9]/gi, "_");

  // a. Prepare Cloudinary Form Data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `shark_uploads/${folderName}`);

  try {
    // b. Upload directly to Cloudinary
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    xhr.upload.addEventListener("progress", ({ loaded, total }) => {
      let fileLoaded = Math.floor((loaded / total) * 100);
      let statusText = fileLoaded < 100 ? "Uploading to Cloud" : "Securing...";

      progressArea.innerHTML = `
        <li class="row">
          <i class="fas fa-file-alt text-pry"></i>
          <div class="file-contents">
            <div class="file-details">
              <span class="name">${name} • ${statusText}</span>
              <span class="percent">${fileLoaded}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: ${fileLoaded}%"></div>
            </div>
          </div>
        </li>`;
    });

    xhr.onreadystatechange = async function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const cloudRes = JSON.parse(xhr.responseText);
          saveToDatabase(userTitle, cloudRes.secure_url, cloudRes.public_id);
        } else {
          progressArea.innerHTML = "";
          showErrorState(xhr.status);
        }
      }
    };
    xhr.send(formData);
  } catch (err) {
    showErrorState("Upload Error");
  }
}

// 5. Save Metadata to MongoDB
async function saveToDatabase(userTitle, url, publicId) {
  try {
    const response = await fetch(`/api/uploads?auth=${authKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userTitle: userTitle,
        cloudinaryUrl: url,
        cloudinaryId: publicId,
      }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      progressArea.innerHTML = "";

      console.log("Mongo DB res:", data);

      if (response.ok) {
        showSuccessState(data);
      } else {
        showErrorState(response.status);
      }
    } else {
      if (response.ok) {
        // Fallback if server responds with 201 but empty body
        progressArea.innerHTML = "";
        showSuccessState({ userTitle: userTitle, fileId: "refresh-page" });
      } else {
        throw new Error("Non-JSON response");
      }
    }
  } catch (err) {
    console.error("The REAL error is:", err);
    showErrorState("DB Error");
  }
}

// 7. Fetches all active Uploads
async function fetchActiveFiles() {
  const listContainer = document.querySelector("#active-files-list");
  if (!listContainer) return;

  try {
    const response = await fetch(`/api/all-files?auth=${authKey}`);
    if (!response.ok) return;

    const files = await response.json();
    listContainer.innerHTML = ""; // Clear loader

    if (files.length === 0) {
      listContainer.innerHTML = '<li class="no-files">No active links found.</li>';
      return;
    }

    files.forEach((file) => {
      const timeRemaining = calculateExpiry(file.createdAt);
      const li = document.createElement("li");
      li.className = "active-file-item";
      li.innerHTML = `
        <div class="file-info">
          <span class="file-name">${file.userTitle}</span>
          <span class="expiry-time ${timeRemaining.isUrgent ? "urgent" : ""}">
            <i class="fa-regular fa-clock"></i> ${timeRemaining.text}
          </span>
        </div>
        <div class="file-actions">
          <button type="button" class="copy-small" onclick="copyManual('/download?id=${file._id}', this)">
            <i class="fa-solid fa-link"></i> Copy Link
          </button>
          <button type="button" class="delete-btn" onclick="deleteFileRecord('${file._id}', this)">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      `;
      listContainer.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading active files:", err);
  }
}

// Time difference between now and expiry (8 days from creation)
function calculateExpiry(createdAt) {
  const created = new Date(createdAt);
  const expiry = new Date(created.getTime() + 8 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const diffMs = expiry - now;

  // Total units
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  // a. More than 24 hours remaining
  if (diffDays > 0) {
    return {
      text: `${diffDays}d ${diffHrs % 24}h remaining`,
      isUrgent: diffDays < 1,
    };
  }
  // b. Less than 24 hours, but more than 1 hour
  else if (diffHrs > 0) {
    return {
      text: `${diffHrs}h ${diffMins % 60}m remaining`,
      isUrgent: true,
    };
  }
  // c. Less than 1 hour remaining
  else if (diffMins > 0) {
    return {
      text: `${diffMins} mins left!`,
      isUrgent: true,
    };
  }
  // d. Expired
  else {
    return { text: "Expired", isUrgent: true };
  }
}

// Admin-only: Delete file record and Cloudinary asset
window.deleteFileRecord = async (id, btn) => {
  if (!confirm("Are you sure you want to delete this file from the cloud and database?")) return;

  try {
    const response = await fetch(`/api/files/${id}?auth=${authKey}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Remove the item from the UI immediately
      btn.closest(".active-file-item").remove();
    } else {
      alert("Failed to delete file.");
    }
  } catch (err) {
    console.error("Delete request failed:", err);
  }
};

// Simple helper for the manual copy buttons
window.copyManual = (path, btn) => {
  const fullLink = window.location.origin + path;
  navigator.clipboard.writeText(fullLink);

  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
  btn.style.background = "#2ecc71";

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
  }, 2000);
};

// 8. UI State Handlers
// Show success state with download link
function showSuccessState(data) {
  const clone = successTemplate.cloneNode(true);
  clone.id = "";
  clone.classList.remove("hidden-state");

  const titleEl = clone.querySelector(".success-text");
  const copyInput = clone.querySelector(".copy-url-input");

  const link = `${window.location.origin}/download?id=${data.fileId}`;
  if (titleEl) {
    titleEl.innerText = `${data.userTitle} Is Ready For Download 🎊`;
  }
  if (copyInput) {
    copyInput.value = link;
  }

  uploadArea.prepend(clone);
  titleInput.value = "";

  fetchActiveFiles();
}

// Show error state with status code
function showErrorState(status) {
  const clone = errorTemplate.cloneNode(true);
  clone.id = "";
  clone.classList.remove("hidden-state");
  clone.querySelector("#error-status").innerText = `Status: ${status}`;
  uploadArea.prepend(clone);
}

// Global Clipboard
window.copyToClipboard = (btn) => {
  const input = btn.parentElement.querySelector(".copy-url-input");

  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value);

    const originalText = btn.innerText;
    btn.innerText = "Copied!";
    btn.classList.add("btn-copied");
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove("btn-copied");
    }, 2000);
  }
};

fetchActiveFiles();
