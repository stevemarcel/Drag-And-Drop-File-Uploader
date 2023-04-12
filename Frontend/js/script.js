const form = document.querySelector(".form");
const fileInput = form.querySelector(".file-input");
const progressArea = document.querySelector(".progress-area");
const uploadArea = document.querySelector(".upload-area");
const uploadIcon = document.querySelector("#upload-icon");

function addBounce() {
  uploadIcon.className = "fa-solid fa-cloud-arrow-up fa-bounce";
}
function removeBounce() {
  uploadIcon.className = "fa-solid fa-cloud-arrow-up";
}

form.addEventListener("click", () => {
  removeBounce();
  fileInput.click();
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  uploadFile(file);
};

function uploadFile(file) {
  // XMLHttpRequest
  let xhr = new XMLHttpRequest();
  // xhr.open("POST", "https://httpbin.org/post"); //Mock API endpoint
  xhr.open("POST", "/uploads");

  xhr.upload.addEventListener("progress", ({ loaded, total }) => {
    loadedKB = Math.floor(loaded / 1000); // loaded file size in KB from bytes
    fileTotalKB = Math.floor(total / 1000); // total file size in KB from bytes

    let fileLoaded = Math.floor((loadedKB / fileTotalKB) * 100); //get percentage of the loaded file

    file ? (fileName = file.name) : null; //Setting file name
    // If the file name is longer than or equal to 12 characters, then cut it off at 12 and add file extension at the end
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 12) + "... ." + splitName[1];
    }
    // Insert uploading card into the HTML document
    let progressAreaHTML = `
    <li class="row">
          <i class="fa-solid fa-file-lines text-light"></i>
          <div class="file-contents">
            <div class="file-details">
              <span class="file-name">${fileName} • Uploading...</span>
              <span class="load-percentage">${fileLoaded}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: ${fileLoaded}%"></div>
            </div>
          </div>
        </li>
    `;
    progressArea.innerHTML = progressAreaHTML;
  });

  xhr.addEventListener("load", () => {
    console.log(xhr.status);
    const res = JSON.parse(xhr.response);
    console.log(res.msg);

    const serverFileName = res.serverFileName;

    let splitServerFileName = serverFileName.split(".");
    uploadedFileName = splitServerFileName[0].substring(0, 12) + "... ." + splitServerFileName[1];
    // let splitServerFileName = serverFileName.split("~");
    // const uploadedFileName = splitServerFileName[1];
    console.log(uploadedFileName);

    let fileSize;
    // If the file size is less than 1000 add "KB" else convert to MB and add "MB"
    fileTotalKB < 1000 ? (fileSize = fileTotalKB + " KB") : (fileSize = (fileTotalKB / 1000).toFixed(2) + " MB");

    if (loadedKB == fileTotalKB) {
      progressArea.innerHTML = "";
      let uploadedAreaHTML = `
      <li class="row">
            <div class="file-contents">
              <i class="fa-solid fa-file-lines text-light"></i>
              <div class="file-details">
                <span class="file-name">${uploadedFileName} • Uploaded</span>
                <span class="file-size">${fileSize}</span>
              </div>
            </div>
            <i class="fa-solid fa-square-check text-light"></i>
          </li>
      `;
      uploadArea.insertAdjacentHTML("afterbegin", uploadedAreaHTML);
    }
  });

  let payload = new FormData(form);
  // payload.append("uploadedFile", file);

  // Inspect the payload
  // for (var pair of payload.entries()) {
  //   console.log(pair[0] + ", " + pair[1]);
  // }
  xhr.send(payload);
}
