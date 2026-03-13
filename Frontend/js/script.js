// Logic: Config -> UI Selectors -> Auth -> Upload -> DB -> UI Updates

// --- 1. CONFIGURATION ---
const CLOUD_NAME = "dphlb0nsu";
const UPLOAD_PRESET = "client_side_shark_upload";
const urlParams = new URLSearchParams(window.location.search);
const authKey = urlParams.get("auth");

// --- 2. SELECTORS ---
const selectors = {
  form: document.querySelector("#upload-form"),
  fileInput: document.querySelector("#file-input"),
  titleInput: document.querySelector("#file-title"),
  progressArea: document.querySelector(".progress-area"),
  uploadArea: document.querySelector(".upload-area"),
  listContainer: document.querySelector("#active-files-list"),
  // Auth specific (only on unauthorized.html)
  loginForm: document.getElementById("loginForm"),
  authInput: document.getElementById("authInput"),
  togglePassword: document.getElementById("togglePassword"),
  eyeIcon: document.getElementById("eyeIcon"),
};

// --- 3. AUTHENTICATION LOGIC (Only runs on Login Page) ---
if (selectors.loginForm) {
  selectors.togglePassword.addEventListener("click", () => {
    const isPass = selectors.authInput.type === "password";
    selectors.authInput.type = isPass ? "text" : "password";
    selectors.eyeIcon.classList.toggle("fa-eye");
    selectors.eyeIcon.classList.toggle("fa-eye-slash");
  });

  selectors.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const key = selectors.authInput.value;
    window.location.href = `${window.location.origin}${window.location.pathname}?auth=${encodeURIComponent(key)}`;
  });
}

// --- 4. FILE UPLOAD & DRAG/DROP (Only runs on Dashboard) ---
if (selectors.form) {
  selectors.form.onclick = () => selectors.fileInput.click();

  selectors.fileInput.onchange = ({ target }) => {
    if (target.files[0]) handleUpload(target.files[0]);
  };

  let dragCounter = 0;
  ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
    selectors.form.addEventListener(evt, (e) => e.preventDefault());
  });

  selectors.form.addEventListener("dragenter", () => {
    dragCounter++;
    selectors.form.classList.add("form-hover");
  });

  selectors.form.addEventListener("dragleave", () => {
    dragCounter--;
    if (dragCounter === 0) selectors.form.classList.remove("form-hover");
  });

  selectors.form.addEventListener("drop", (e) => {
    dragCounter = 0;
    selectors.form.classList.remove("form-hover");
    if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
  });
}

// --- 5. CORE FUNCTIONS ---
// Upload handling function
async function handleUpload(file) {
  const userTitle = selectors.titleInput.value.trim() || file.name;
  const folderName = userTitle.replace(/[^a-z0-9]/gi, "_");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `shark_uploads/${folderName}`);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

  xhr.upload.onprogress = ({ loaded, total }) => {
    let percent = Math.floor((loaded / total) * 100);
    let status = percent < 100 ? "Uploading..." : "Securing...";
    renderProgress(file.name, percent, status);
  };

  xhr.onload = async () => {
    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);
      await saveToDatabase(userTitle, res.secure_url, res.public_id);
    } else {
      showError(xhr.status);
    }
  };
  xhr.send(formData);
}

// Database saving function
async function saveToDatabase(title, url, id) {
  try {
    const res = await fetch(`/api/uploads?auth=${authKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userTitle: title, cloudinaryUrl: url, cloudinaryId: id }),
    });
    const data = await res.json();
    selectors.progressArea.innerHTML = "";
    if (res.ok) showSuccess(data);
    else showError(res.status);
  } catch (err) {
    showError("DB_ERR");
  }
}

// Fetch and display active files on page load
async function fetchActiveFiles() {
  if (!selectors.listContainer) return;
  try {
    const res = await fetch(`/api/all-files?auth=${authKey}`);
    const files = await res.json();
    selectors.listContainer.innerHTML = files.length
      ? ""
      : '<li class="no-files" style="color:white; text-align:center; padding:20px;">No active links found.</li>';

    files.forEach((file) => {
      const expiry = calculateExpiry(file.createdAt);
      const li = document.createElement("li");
      li.className = "active-file-item";
      li.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.userTitle}</span>
                    <span class="expiry-time ${expiry.isUrgent ? "urgent" : ""}">
                        <i class="fa-regular fa-clock"></i> ${expiry.text}
                    </span>
                </div>
                <div class="file-actions">
                    <button type="button" class="copy-small" onclick="window.copyManual('/download?id=${file._id}', this)">
                        <i class="fa-solid fa-link"></i> Copy Link
                    </button>
                    <button type="button" class="delete-btn" onclick="window.deleteFileRecord('${file._id}', this)">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>`;
      selectors.listContainer.appendChild(li);
    });
  } catch (e) {
    console.error("Load failed", e);
  }
}

// --- 6. HELPERS ---
// Expiry calculation function
function calculateExpiry(date) {
  const diff = new Date(date).getTime() + 8 * 24 * 60 * 60 * 1000 - Date.now();
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (diff <= 0) return { text: "Expired", isUrgent: true };
  return {
    text: days > 0 ? `${days}d ${hrs}h left` : `${hrs}h remaining`,
    isUrgent: days < 1,
  };
}

// Progress bar rendering function
function renderProgress(name, pct, status) {
  selectors.progressArea.innerHTML = `
        <li class="row">
            <div class="file-details">
                <span class="name">
                    <i class="fas fa-file-alt"></i> ${name}
                </span>
                <span class="percent">${pct}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width:${pct}%"></div>
            </div>
            <p class="progress-bar-status">${status}</p>
        </li>`;
}

// Success display function
function showSuccess(data) {
  const temp = document.getElementById("success-template").cloneNode(true);
  temp.id = "";
  temp.classList.remove("hidden-state");
  temp.querySelector(".success-text").innerText = `${data.userTitle} Is Ready! 🎊`;
  temp.querySelector(".copy-url-input").value =
    `${window.location.origin}/download?id=${data.fileId}`;
  selectors.uploadArea.prepend(temp);
  selectors.titleInput.value = "";
  fetchActiveFiles();
}

// Error display function
function showError(msg) {
  const temp = document.getElementById("error-template").cloneNode(true);
  temp.id = "";
  temp.classList.remove("hidden-state");
  temp.querySelector("#error-status").innerText = `Error: ${msg}`;
  selectors.uploadArea.prepend(temp);
}

// --- 7. GLOBAL WINDOW ATTACHMENTS ---
// Error dismissal handler
window.dismissError = (btn) => {
  if (selectors.progressArea) selectors.progressArea.innerHTML = "";
  btn.parentElement.remove();
};

// Manual copy function for active links
window.copyManual = (path, btn) => {
  const fullLink = window.location.origin + path;

  navigator.clipboard.writeText(fullLink).then(() => {
    const originalHtml = btn.innerHTML;
    const originalBg = btn.style.backgroundColor;

    // Apply green state
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
    btn.style.setProperty("background-color", "#27ae60", "important");
    btn.style.setProperty("border-color", "#27ae60", "important");

    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.style.setProperty("background-color", originalBg);
      btn.style.setProperty("border-color", "rgba(255, 255, 255, 0.2)");
    }, 2000);
  });
};

// Clipboard copy function for success messages
window.copyToClipboard = (btn) => {
  const input = btn.parentElement.querySelector(".copy-url-input");
  navigator.clipboard.writeText(input.value);
  btn.innerText = "Copied!";
  setTimeout(() => (btn.innerText = "Copy"), 2000);
};

// Delete confirmation modal
function confirmDelete() {
  const modal = document.getElementById("custom-modal");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  return new Promise((resolve) => {
    // Show the modal
    modal.classList.remove("hidden-state");

    // Click handlers
    confirmBtn.onclick = () => {
      modal.classList.add("hidden-state");
      resolve(true);
    };

    cancelBtn.onclick = () => {
      modal.classList.add("hidden-state");
      resolve(false);
    };
  });
}

// Delete file record function for active links
window.deleteFileRecord = async (id, btn) => {
  // Wait for user to click the custom modal
  const isConfirmed = await confirmDelete();

  if (!isConfirmed) return;

  try {
    const res = await fetch(`/api/files/${id}?auth=${authKey}`, { method: "DELETE" });
    if (res.ok) {
      const item = btn.closest(".active-file-item");
      item.style.opacity = "0";
      item.style.transform = "scale(0.9)";
      setTimeout(() => item.remove(), 300);
    } else {
      alert("Failed to delete file from server.");
    }
  } catch (err) {
    console.error("Delete failed", err);
  }
};

// Start
fetchActiveFiles();
