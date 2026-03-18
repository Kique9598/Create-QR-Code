// gather elements
const input = document.getElementById("input-url");
const qrcodeEl = document.getElementById("qrcode");
const wrapper = document.getElementById("qrcode-wrapper");
const btnCopy = document.getElementById("button-copy");
const btnDownload = document.getElementById("button-download");
const btnClose = document.getElementById("button-close");
let qrcodeInstance = null;

// function to get the size of the qrcode
function getQrSize() {
  const size = Math.min(wrapper.clientWidth, wrapper.clientHeight) - 36;
  return Math.max(size, 128);
}

// set input value to page url
function initWithCurrentTab() {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var url = tabs[0] && tabs[0].url ? tabs[0].url : "";
      input.value = url;
      renderQr(url);
      input.focus();
      input.select();
    });
  } else {
    input.placeholder = "Enter URL or text";
    renderQr("");
    input.focus();
    input.select();
  }
}

// render qrcode based on input value
function renderQr(text) {
  var value = (text ?? input.value ?? "").trim();
  if (!value) {
    if (qrcodeInstance) {
      qrcodeInstance.clear();
      qrcodeInstance = null;
    }
    qrcodeEl.innerHTML = "";
    return;
  }
  if (qrcodeInstance) {
    qrcodeInstance.clear();
    qrcodeInstance.makeCode(value);
  } else {
    qrcodeInstance = new QRCode(qrcodeEl, value, {
      width: getQrSize(),
      height: getQrSize(),
    });
  }
}

// get QR code as PNG blob (from canvas or img)
function getQrImageBlob() {
  const canvas = qrcodeEl.querySelector("canvas");
  const img = qrcodeEl.querySelector("img");
  if (canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, "image/png");
    });
  }
  if (img && img.src) {
    return fetch(img.src).then(function (r) {
      return r.blob();
    });
  }
  return Promise.resolve(null);
}

// copy input text to clipboard
function copyQrToClipboard() {
  var text = input.value.trim();
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(function () {
      btnCopy.textContent = "Copied!";
      setTimeout(function () {
        btnCopy.textContent = "Copy";
      }, 1500);
    })
    .catch(function () {
      btnCopy.textContent = "Failed";
      setTimeout(function () {
        btnCopy.textContent = "Copy";
      }, 1500);
    });
}

// download QR image as PNG file
function downloadQrImage() {
  getQrImageBlob().then(function (blob) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// add event listener to input
input.addEventListener("input", function () {
  renderQr(input.value);
});

btnCopy.addEventListener("click", copyQrToClipboard);
btnDownload.addEventListener("click", downloadQrImage);
btnClose.addEventListener("click", function () {
  window.close();
});

// initialize with current tab
initWithCurrentTab();
