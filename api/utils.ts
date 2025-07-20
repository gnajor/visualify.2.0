import { getCookies, setCookie } from "jsr:@std/http/cookie";

export async function getCountryFromWikdata(spotifyId: string): Promise<any | null>{
    const query = `SELECT ?artist ?artistLabel ?countryLabel 
                        WHERE {
                            ?artist wdt:P1902 "${spotifyId}".
                            OPTIONAL { ?artist wdt:P27 ?country. }
                            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                        }`;    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://query.wikidata.org/sparql?query=${encodedQuery}`;
    const options  = {
        headers: {
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'Visualify/1.0 (leo.muhl04@gmail.com)'
        }
    };

    try {
        const request = await fetch(url, options);
        const response = await request.json();   
        return response; 
    } 
    catch (error) {
        console.error('Error', error);
        return null;
    }
}

export async function getCountryFromMusicBrainz(artistName: string): Promise<any | null>{
    const url = `https://musicbrainz.org/ws/2/artist/?query=artist:"${artistName}"&fmt=json`;
    const options = {
        headers: {'User-Agent': 'Visualify/1.0 (lucmov99@gmail.com)'}
    };

    try {
        const request = await fetch(url, options);
        const response = await request.json();
        const artists = response.artists || [];

        if (artists.length === 0) return null;
        const exactArtist = artists.find((artist: any) => artist.name.toLowerCase() === artistName.toLowerCase());
        return exactArtist;    
    } 
    catch(error) {
        console.error('Error:', error);
        return null;
    }
}

export async function setToken(data: Record<string, string>): Promise<Response>{
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const headers = new Headers();

    setCookie(headers, {
        name: "access_token",
        value: accessToken,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 3600
    });

    setCookie(headers, {
        name: "refresh_token",
        value: refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 3600
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
    });
}

export async function handleLogout(): Promise<Response>{
    return new Response("Logged out", {
        status: 200,
        headers: {
            "Set-Cookie": [
                "access_token=; HttpOnly; Path=/; Max-Age=0",
                "refresh_token=; HttpOnly; Path=/; Max-Age=0"
            ].join("\n"),
        }
    });
}

export async function authSpotifyUser(request: Request): Promise<Response | string>{
    const cookies = getCookies(request.headers);
    let accessToken = cookies["access_token"];
    const refreshToken = cookies["refresh_token"];

    if(!accessToken || !refreshToken){
        return new Response("unauthorized", {status: 401});
    }

    let response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if(response.status === 401){
        const refreshed = await refreshAccessToken(refreshToken);

        if(!refreshed){
            return new Response(JSON.stringify("Session expired"), {status: 401});
        }

        accessToken = refreshed.access_token;

        const headers = new Headers();
        setCookie(headers, {
            name: "access_token",
            value: accessToken,
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
            path: "/",
            maxAge: refreshed.expires_in, 
        });

        response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if(!response.ok){
            return new Response(JSON.stringify("Still unauthorized"), { status: 401, headers });
        }
        return accessToken;
    }
    return accessToken;
}

async function refreshAccessToken(refreshToken: string): Promise<null | { access_token: string, expires_in: number }>{
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");

    if(!clientId){
        return null;
    }

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
    });

    try{
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        });

        const data = await response.json();
        return {
            access_token: data.access_token,
            expires_in: data.expires_in
        }
    }
    catch(error){
        console.error(error);
        return null;
    }    
}

