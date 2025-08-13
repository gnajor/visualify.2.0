import { authSpotifyUser, getCountryFromMusicBrainz, getCountryFromWikdata, handleLogout, setToken } from "./utils.ts";

export async function handleRequests(request: Request): Promise<Response>{
    const url = new URL(request.url);
    const pathname = url.pathname;

    if(pathname === "/api/top-items" && request.method === "GET"){
        const type = url.searchParams.get("type");
        const range = url.searchParams.get("range");
        const offset = url.searchParams.get("offset");
        const token = await authSpotifyUser(request);

        if(typeof token !== "string"){
            return new Response(JSON.stringify("unathorized"), {status: 401});
        }

        const spotifyUrl = `https://api.spotify.com/v1/me/top/${type}?time_range=${range}&limit=50&offset=${offset}`;
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const spotifyResponse = await fetch(spotifyUrl, options);
            const response = await spotifyResponse.json();
            const topItems = response.items;

            return new Response(JSON.stringify(topItems), {status: 200});
        } 
        catch(error) {
            return new Response(JSON.stringify('Error: ' + error), {status: 500})
        }
    }

    if(pathname === "/api/latest-songs" && request.method === "GET"){
        const data = await request.json();
        const days = data.days;
        const token = await authSpotifyUser(request);
        const promises = [];
        
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }

        for(let i = 1; i <= days; i++){
            const now = Date.now();
            const secondsAgo = now - (i * 24 * 60 * 60 * 1000);
            const url = `https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${secondsAgo}`;

            const response = await fetch(url, options);
            const resource = await response.json();
            promises.push(resource);
        }

        try {
            const responses = await Promise.all(promises);
            const latestItems = responses.map(response => response.items);
            return new Response(JSON.stringify(latestItems), {status: 200});
        } 
        catch(error) {
            return new Response(JSON.stringify('Error: ' + error), {status: 500})
        }
    }

    if(pathname === "/api/song-country" && request.method === "GET"){
        const data = await request.json();
        const spotifyId = data.spotifyId;
        const artistName = data.artistName;
        const wikidataCountry = await getCountryFromWikdata(spotifyId);
        const responseData: Record<string, any> = {};

        if (wikidataCountry.results.bindings.length > 0){
            responseData.source = "wikidata";
            responseData.result = wikidataCountry;
        }

        else{
            const musicbrainzCountry = await getCountryFromMusicBrainz(artistName);
            responseData.source = "musicbrainz";
            responseData.result = musicbrainzCountry;
        }

        return new Response(JSON.stringify(responseData), {status: 200});
    }

    if(pathname === "/api/set-token" && request.method === "POST"){
        const data = await request.json();
        const code = data.code;
        const codeVerifier = data.codeVerifier;

        const clientId = "aa99b24e94d448eab167b514b89f2de2";
        const redirectUri = "https://visualify.deno.dev/" /* "http://127.0.0.1:8888/" */;

        if(!clientId){
            return new Response(JSON.stringify({error: "client_id does not exist"}), {status: 500});
        }

        if(!redirectUri){
            return new Response(JSON.stringify({error: "redirect_uri does not exist"}), {status: 500});
        }

        const body = new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
            scope:"user-read-recently-played"
        });

        try{
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body
            });

            const tokenData = await response.json();
            return await setToken(tokenData);
        }
        catch(error){
            return new Response(JSON.stringify('Error: ' + error), {status: 500})
        }
    }

    if(pathname === "/api/logout" && request.method === "POST"){
        return await handleLogout();
    }

    if(pathname === "/api/check-token-auth" && request.method === "GET"){
        const token = await authSpotifyUser(request);

        if(typeof token === "string"){
            return new Response(JSON.stringify("Authorized"), {status: 202})
        }
        else{
            return token;
        }
    }

    return new Response(JSON.stringify('Error: url does not exist'), {status: 400});
}
