const form = document.querySelector(".form");
fileInput = form.querySelector(".file-input");
progressArea = form.querySelector(".progress-area");
uploadArea = form.querySelector(".upload-area");

form.addEventListener("click", () => {
  fileInput.click();
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  if (file) {
    // let fileName = file.name;
    console.log(file);
    uploadFile(file);
  }
};

function uploadFile(file) {
  const formData = new FormData();
  formData.append("file-uploaded", file);

  console.log(...formData);

  fetch("http://localhost:5000/uploads", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => console.log(data));
}
