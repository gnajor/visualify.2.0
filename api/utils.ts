import { getCookies, setCookie } from "jsr:@std/http/cookie";
import { Album, Artist, Song, Genre } from "../db/interfaces.ts";

export function sleep(ms: number): Promise<Function>{
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getCountryFromWikdata(spotifyId: string): Promise<any | null>{
    const query = `SELECT ?artist ?artistLabel ?countryLabel WHERE {
                    ?artist wdt:P1902 "${spotifyId}".
                        {
                            ?artist wdt:P495 ?country.
                        }
                        UNION {
                            ?artist wdt:P740 ?place.
                            ?place wdt:P17 ?country.
                        }

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

    const request = await fetch(url, options);
    const data = await request.json();  

    if(!data?.results?.bindings)return null
    const bindings = data.results.bindings;
    if(bindings.length < 0) return null
    if(!bindings[0]?.countryLabel?.value) return null

    return bindings[0].countryLabel.value;
}

export async function getSongsFeatures(songs: Array<any>): Promise<any | null>{
    const apiKey = Deno.env.get("CEREBRAS_API_KEY");

    if (!apiKey) {
        throw new Error("API key is missing");
    }

    const instructions = `I want you to analyze the overall mood/feel of these songs one by one. Choose the top 2 categories from this list that best describe each song: Happy, Sad, Energy, Calm, Intense. Do NOT invent new categories. Return ONLY valid JSON in one line, formatted like this: [{"track": "Song Title 1", "artist": "Artist Name", "moods": ["Mood1","Mood2"]},{"track": "Song Title 2", "artist": "Artist Name", "moods": ["Mood1","Mood2"]}] Do not add any extra text, comments, or line breaks.`;
    let songsStr = "The songs and artists: ";

    for(const song of songs){
        songsStr += `${song.title} by ${song.artist}, `;
    }

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-4-scout-17b-16e-instruct",
            messages: [
                { role: "user", content: instructions + songsStr},
            ],
            max_tokens: 2000,          // long answer
            temperature: 0.2,          // lower = more careful
            top_p: 0.9              //no clue
        }),
    });

    const data = await response.json();

    if(data.choices[0].message.content){
        return JSON.parse(data.choices[0].message.content);
    }
    else{
        return null;
    }



/*     const mbUrl = `https://musicbrainz.org/ws/2/recording/?query=artist:"${encodeURIComponent(artist)}"%20AND%20recording:"${encodeURIComponent(title)}"&fmt=json`;
    const mbResponse = await fetch(mbUrl);
    const mbData = await mbResponse.json();

    if(mbData.error){
        await sleep(5000);
        await getSongFeatures(artist, title);
    }

    if(!mbData.recordings || mbData.recordings.length === 0){
        await sleep(5000);
        return null;
    }

    const mbid = mbData.recordings[0].id;

    const abUrl = `https://acousticbrainz.org/${mbid}/high-level`;
    const abResponse = await fetch(abUrl);
    const abData = await abResponse.json();

    if(abData.message === "Not found"){
        console.log(abData)
        return null
    }
    else{
        console.log(abData)
    }

    const features = {
        "danceability": abData.highlevel?.danceability?.all?.danceable,
        "energy": abData.highlevel?.mood_party?.all?.party,
        "happy": abData.highlevel?.mood_happy?.all?.happy,
        "sad": abData.highlevel?.mood_sad?.all?.sad,
        "acoustic": abData.highlevel?.mood_acoustic?.all?.acoustic
    }
    return features; */
}

export async function getCountryFromMusicBrainz(artistName: string): Promise<string | null>{
    const artistUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:"${artistName}"&fmt=json`;
    const options = { headers: { 'User-Agent': 'Visualify/1.0 (leo.muhl04@gmail.com)' } };

 
    const artistRes = await fetch(artistUrl, options);
    const artistData = await artistRes.json();

    if(artistData.error){
        console.log(artistData.error);
        await sleep(2000);
    }

    const artists = artistData.artists || [];

    if (artists.length === 0) return null;

    const exactArtist = artists.find((a: any) => a.name.toLowerCase() === artistName.toLowerCase());
    if (!exactArtist?.area?.id) return null;

    const areaRes = await fetch(`https://musicbrainz.org/ws/2/area/${exactArtist.area.id}?fmt=json`, options);
    const areaData = await areaRes.json();

    if(areaData.error){
        console.log(areaData.error)
        await sleep(5000);
        await getCountryFromMusicBrainz(artistName);
    }

    if (areaData.type === "Country") {
        return areaData.name;
    }

    if (areaData.relations) {
        const parent = areaData.relations.find((r: any) => r.type === "part of" && r.area?.type === "Country");
        if (parent) return parent.area.name;
    }

    return null;
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
    const clientId = /* Deno.env.get("SPOTIFY_CLIENT_ID") */ "aa99b24e94d448eab167b514b89f2de2";

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

export function formatArtistsData(artists: any[]): Artist[]{
    const formatted: Artist[] = [];

    for(const artist of artists){
        const artistObj: Artist = {
            "link": artist?.external_urls?.spotify,
            "popularity": artist?.popularity,
            "name": artist?.name,
            "image": artist?.images[0]?.url,
        }

        const genreObj: Genre = {
          
        }
    }
}

export function formatSongsData(songs: any[]): {
        "songs": Song[],
        "artists": Artist[],
        "albums": Album[]
    }{
    const formatted = {
        "songs": [] as Song[],
        "artists": [] as Artist[],
        "albums": [] as Album[]
    }

    for(const song of songs){
        const songObj: Song = {
            "title": song?.name,
            "duration": song?.duration_ms,
            "popularity": song?.popularity,
            "link": song?.external_urls?.spotify,
            "explicit": song?.explicit,
        }

        const artistObj: Artist = {
            "name": song?.artists[0]?.name,
            "link": song?.artists[0]?.external_urls?.spotify,
        }

        const albumObj: Album = {
            "name": song?.album?.artists[0]?.name,
            "image": song?.album?.images[0]?.url,
            "link": song?.album?.external_urls?.spotify,
            "release_year": song?.album?.release_date.split("-")[0],
            "total_tracks": song?.album?.total_tracks
        }

        formatted.songs.push(songObj);
        formatted.artists.push(artistObj);
        formatted.albums.push(albumObj);
    }

    return formatted;
}

/* export function getMostPlayedData(){
    const ranges = Object.keys(State.userData.artists);
    const formatted = {}
    const amount = 50;

    formatted.artists = {};
    formatted.tracks = {};
        
    for(const range of ranges){
        let artistPopularitySum = 0;
        let trackPopularitySum = 0;

        formatted.artists[range] = State.userData.artists[range].map((artist, i) => {
            if(i === 0){
                State.setStateOverlayData("mostListenedArtist", range, {
                    image: artist?.images[0]?.url,
                    name: artist.name,
                });
            }

            artistPopularitySum += artist.popularity;

            return {
                name: artist.name,
                image: artist?.images[0]?.url,
                popularity: artist.popularity,
                ranking: i + 1
            }
        });

        formatted.tracks[range] = State.userData.tracks[range].map((track, i) => {
            if(i === 0){
                State.setStateOverlayData("mostListenedTrack", range, {
                    image: track.album.images[0].url,
                    name: track.name,
                });
            }

            trackPopularitySum += track.popularity;

            return {
                name: track.name,
                image: track.album.images[0].url,
                popularity: track.popularity,
                ranking: i + 1,
            }
        });

        const avgTrackPopularity = Number((trackPopularitySum / State.userData.tracks[range].length));
        const avgArtistPopularity = Number((artistPopularitySum / State.userData.artists[range].length));
        
        State.setStateOverlayData("avgTrackPopularity", range, avgTrackPopularity);
        State.setStateOverlayData("avgArtistPopularity", range, avgArtistPopularity);

        formatted.artists[range].slice(0, amount);
        formatted.tracks[range].slice(0, amount);
    }
    
    return formatted;
} */