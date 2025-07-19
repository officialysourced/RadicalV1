
 //       _ __       _ _ _   
// ___/ |/ /_   __| (_) |__ 
// / __| | '_ \ / _` | | '_ \ 
// \__ \ | (_) | (_| | | | | |
// |___/_|\___/ \__,_|_|_| |_|


const scramjet = new ScramjetController({
  prefix: "/service/scramjet/",
  files: {
    wasm: "/scramjet/scramjet.wasm.wasm",
    worker: "/scramjet/scramjet.worker.js",
    client: "/scramjet/scramjet.client.js",
    shared: "/scramjet/scramjet.shared.js",
    sync: "/scramjet/scramjet.sync.js"
  }
});


async function registerServiceWorker(proxyt) {
  if (!('serviceWorker' in navigator)) return;

  const swpath = '/sw.js';

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      await reg.unregister();
    }

    await navigator.serviceWorker.register(swpath);
    console.log(`sw registered for ${proxyt}`);
  } catch (err) {
    console.error("sw registration failed", err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById("input");
  const iframe = document.getElementById("proxyIframe");
  const proxysel = document.getElementById("proxysel");
  const backBtn = document.getElementById("backBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const reloadBtn = document.getElementById("reloadBtn");



  // wisp and transport stuff 
  const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
  const wisp = location.origin.includes("8080")
    ? `${location.protocol === "http:" ? "ws:" : "wss:"}//${location.host}/wisp/`
    : "wss://wisp.terbiumon.top/wisp/";

  await connection.setTransport("/epoxy/index.mjs", [{ wisp }]);

  scramjet.init();

  const sproxy = localStorage.getItem('sproxy');
  if (sproxy) {
    proxysel.value = sproxy;
  }

  registerServiceWorker(proxysel.value);

  proxysel.addEventListener('change', e => {
    const selected = e.target.value;
    localStorage.setItem('sproxy', selected);
    registerServiceWorker(selected);
  });

  // yeebsweb the fucking goat 
  const resolveURL = (inputVal) => {
    const trimmed = inputVal.trim();
    const searchURL = "https://yeebsweb.com/search?q=%s";

    try {
      return new URL(trimmed).toString();
    } catch {
      try {
        const guess = new URL("https://" + trimmed);
        if (guess.hostname.includes(".")) return guess.toString();
      } catch {}
    }

    return searchURL.replace("%s", encodeURIComponent(trimmed));
  };

  const historyStack = [];
  let currentIndex = -1;

  function loadPage(url) {
    let proxiedUrl;
    const proxy = proxysel.value;
  // envadeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
    switch (proxy) {
      case "uv":
        proxiedUrl = __uv$config?.encodeUrl
          ? __uv$config.prefix + __uv$config.encodeUrl(url)
          : url;
        break;
      case "scramjet":
        proxiedUrl = scramjet.encodeUrl?.(url) || url;
        break;
      case "envade":
        proxiedUrl = self.__envade$config?.codec
          ? self.__envade$config.prefix + self.__envade$config.codec.encode(url)
          : url;
        break;
      default:
        proxiedUrl = url;
    }

    iframe.src = proxiedUrl;
    input.value = url;
  }

  function push(url) {
    historyStack.splice(currentIndex + 1);
    historyStack.push(url);
    currentIndex++;
  }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      const url = resolveURL(input.value);
      push(url);
      loadPage(url);
    }
  });

  backBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      loadPage(historyStack[currentIndex]);
    }
  });

  forwardBtn.addEventListener("click", () => {
    if (currentIndex < historyStack.length - 1) {
      currentIndex++;
      loadPage(historyStack[currentIndex]);
    }
  });

  reloadBtn.addEventListener("click", () => {
    if (currentIndex >= 0) {
      loadPage(historyStack[currentIndex]);
    }
  });
});
