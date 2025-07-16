function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  const s3Url = "https://<your-upload-bucket>.s3.amazonaws.com/" + file.name;

  fetch(s3Url, {
    method: "PUT",
    body: file
  }).then(() => alert("Archivo subido")).catch(console.error);
}

function fetchSummary() {
  fetch("https://<your-api-gateway-url>/summary")
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").textContent = JSON.stringify(data, null, 2);
    });
}
