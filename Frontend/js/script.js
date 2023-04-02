const form = document.querySelector(".form");
const fileInput = form.querySelector(".file-input");
const progressArea = document.querySelector(".progress-area");
const uploadArea = document.querySelector(".upload-area");

form.addEventListener("click", () => {
  fileInput.click();
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  uploadFile(file);
};

function uploadFile(file) {
  if (file) {
    let fileName = file.name;
    console.log(file);
  }
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "https://httpbin.org/post");
  // xhr.setRequestHeader("Content-Length", file.size);
  // xhr.open("POST", "http://localhost:5000/uploads");
  xhr.upload.addEventListener("progress", (e) => {
    console.log(e);
    // let fileLoaded = Math.floor((loaded / total) * 100); //get percentage of the loaded file
    // let fileTotal = Math.floor(total / 1000); // total file size in KB from bytes
    // console.log(fileLoaded, fileTotal);

    // let progressAreaHTML = `
    // <li class="row">
    //       <i class="fa-solid fa-file-lines text-light"></i>
    //       <div class="file-contents">
    //         <div class="file-details">
    //           <span class="file-name">${name} • Uploading...</span>
    //           <span class="load-percentage">${fileLoaded}%</span>
    //         </div>
    //         <div class="progress-bar">
    //           <div class="progress" style="width: ${fileLoaded}"></div>
    //         </div>
    //       </div>
    //     </li>
    // `;
    // progressArea.innerHTML = progressAreaHTML;

    // let uploadedAreaHTML = `
    // <li class="row">
    //       <div class="file-contents">
    //         <i class="fa-solid fa-file-lines text-light"></i>
    //         <div class="file-details">
    //           <span class="file-name">img01.png • Uploaded</span>
    //           <span class="file-size">50 KB</span>
    //         </div>
    //       </div>
    //       <i class="fa-solid fa-square-check text-pry"></i>
    //     </li>
    // `;
    // uploadArea.innerHTML = uploadedAreaHTML;
  });

  let payload = new FormData(form);
  // payload.append("uploadedFile", file);
  xhr.send(payload);
}
