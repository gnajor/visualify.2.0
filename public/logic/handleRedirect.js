export async function handleRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const codeVerifier = localStorage.getItem('codeVerifier');

    if (!code) {
        console.warn('No code found in URL');
        return;
    }

    if (!codeVerifier) {
        console.warn('No code verifier in localStorage');
        return;
    }

    // Optional: clean up URL
    window.history.replaceState({}, document.title, "/");

    // Send to backend to exchange for token
    const response = await fetch("/api/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, codeVerifier })
    });

    if (response.ok) {
        console.log("Authenticated!");
        window.location.href = "/";
    } else {
        console.error("Failed to authenticate");
    }

}


