const form = document.getElementById("qrForm");
const input = document.getElementById("urlInput");
const error = document.getElementById("error");
const result = document.getElementById("result");
const qrImage = document.getElementById("qrImage");
const linkPreview = document.getElementById("linkPreview");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");

let currentUrl = "";

function normalizeUrl(value) {
  const trimmed = value.trim();

  // Allow users to enter example.com without https://
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS links are supported.");
  }

  return url.href;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  error.textContent = "";
  status.textContent = "";

  try {
    currentUrl = normalizeUrl(input.value);

    // Generate the QR with the exact normalized URL.
    const temp = document.createElement("div");

    new QRCode(temp, {
      text: currentUrl,
      width: 260,
      height: 260,
      correctLevel: QRCode.CorrectLevel.H
    });

    const canvas = temp.querySelector("canvas");
    const img = temp.querySelector("img");

    if (canvas) {
      qrImage.src = canvas.toDataURL("image/png");
    } else if (img) {
      qrImage.src = img.src;
    }

    linkPreview.href = currentUrl;
    linkPreview.textContent = currentUrl;

    result.classList.remove("hidden");
  } catch (err) {
    result.classList.add("hidden");
    error.textContent = "Please enter a valid URL, for example: https://example.com";
  }
});

downloadBtn.addEventListener("click", () => {
  if (!currentUrl || !qrImage.src) return;

  const link = document.createElement("a");
  link.href = qrImage.src;
  link.download = "qr-code.png";
  document.body.appendChild(link);
  link.click();
  link.remove();

  status.textContent = "QR code downloaded.";
});

copyBtn.addEventListener("click", async () => {
  if (!currentUrl) return;

  try {
    await navigator.clipboard.writeText(currentUrl);
    status.textContent = "Link copied.";
  } catch {
    status.textContent = "Could not copy automatically.";
  }
});
