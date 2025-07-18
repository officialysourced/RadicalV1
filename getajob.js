// Thx Zeeless at boredomearcade for the search.js https://discord.gg/7YAttzMc
       const urlParams = new URLSearchParams(window.location.search);
        const encodedUrl = urlParams.get('url');

        if (encodedUrl) {
            console.log("Encoded URL from query string:", encodedUrl);

            const iframe = document.getElementById("proxyIframe");
            iframe.src = encodedUrl;
        } else {
            console.error("No URL found in the query string.");
        }