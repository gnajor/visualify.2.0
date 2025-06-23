export async function handleRedirect() {
    /* Parse to obtain code param */
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams)
    /* Code = necessary to request access token */
    const code = urlParams.get('code');
    const codeVerifier = localStorage.getItem('codeVerifier');

    if(!code){
        console.warn('No code found');
        return;
    }

    if(!codeVerifier){
        console.warn('No code verifier found');
        return;
    }
//get redirectUri
    window.history.replaceState({}, document.title, "/callback");

    await fetch("/api/set-token", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            code,
            codeVerifier
        })
    });
}


