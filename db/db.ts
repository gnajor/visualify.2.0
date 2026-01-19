import { createClient } from "jsr:@supabase/supabase-js@2";
import { Artist, Song, Genre, Album, mood } from "./interfaces.ts";
import { formatGenres } from "./utils.ts";


const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_KEY")!,
);

 export async function insertSongsBulk(data: {"song": Song, "album": Album, "artist": Artist}[]): Promise<void>{
    if(data.length === 0) return;

    const songIds = data.map(item => item.song.id);

    const {data: existingSongs, error: fetchError } = await supabase
        .from("song")
        .select("id")
        .in("id", songIds);

    if(fetchError) throw fetchError;  

    const shouldInsert = [];

    for(const item of data){
        const exists = existingSongs.some(existingSong => existingSong.id === item.song.id);

        if(!exists) shouldInsert.push(item);
    }
    
    if(shouldInsert.length === 0) return;

    const artists = shouldInsert.map(item => item.artist);
    const songs = shouldInsert.map(item => {
        item.song.artist_id = item.artist.id;
        item.song.album_id = item.album.id;
        return item.song
    });
    const albums = shouldInsert.map(item =>  {
        item.album.artist_id = item.artist.id;
        return item.album;
    });

    
    const shouldInsertArtists = artists.filter((elem, i, self) => i === self.findIndex(artist => artist.id === elem.id));
    const shouldInsertAlbums = albums.filter((elem, i, self) => i === self.findIndex(album => album.id === elem.id));
    const shouldInsertSongs = songs.filter((elem, i, self) => i === self.findIndex(song => song.id === elem.id));

    await insertArtistsBulk(shouldInsertArtists);
    await insertAlbums(shouldInsertAlbums);   

    const {error} = await supabase
        .from("song")
        .insert(shouldInsertSongs)

    if(error) throw error;
}

export async function insertAlbums(data: Album[]) {
    if(data.length === 0) return;

    const albumIds = data.map(item => item.id);

    const {data: existingAlbums, error: fetchError } = await supabase
        .from("album")
        .select("id")
        .in("id", albumIds);

    if(fetchError) throw fetchError;  

    const shouldInsert = [];

    for(const item of data){
        const exists = existingAlbums.some(existingAlbum => existingAlbum.id === item.id);

        if(!exists) shouldInsert.push(item);
    }

    if(shouldInsert.length === 0) return;

    const {error} = await supabase
        .from("album")
        .insert(shouldInsert)

    if(error) throw error;
} 

export async function insertArtistsBulk(artists: Artist[]){
    if(artists.length === 0) return;

    const artistIds = artists.map(artist => artist.id);

    const {data: existingArtists, error: existingArtistsError} = await supabase
        .from("artist")
        .select("id")
        .in("id", artistIds);

    if(existingArtistsError) throw existingArtistsError;  

    const shouldInsert = [];

    for(const artist of artists){
        const exists = existingArtists.some(existingArtist => existingArtist.id === artist.id);

        if(!exists) shouldInsert.push(artist);
    }

    if(shouldInsert.length === 0) return;
    
    const shouldInsertArtists = JSON.parse(JSON.stringify(shouldInsert));
    shouldInsertArtists.forEach((artist: Artist) => delete artist.genres);
    
    const {error} = await supabase
        .from("artist")
        .insert(shouldInsertArtists)

    if(error) throw error;  


    await insertGenres(formatGenres(shouldInsert));
    await insertArtistGenres(formatGenres(shouldInsert));
}

export async function insertGenres(genres: Genre[]){
    if(genres.length === 0) return;

    const uniqGenreNames = genres.filter((elem, i, self) => i === self.findIndex(genre => genre.name === elem.name));
    const genreNames = uniqGenreNames.map(genre => genre.name);

    const {data: existingGenres, error: fetchError } = await supabase
        .from("genre")
        .select("name")
        .in("name", genreNames);

    if(fetchError) throw fetchError; 

    const shouldInsertGenres = [];

    for(const genre of uniqGenreNames){
        const exists = existingGenres.some(existingGenre => existingGenre.name === genre.name);
        delete genre.artist_id;
        if(!exists) shouldInsertGenres.push(genre);
    }

    if(shouldInsertGenres.length === 0) return;

    const {error} = await supabase
        .from("genre")
        .insert(shouldInsertGenres)
        .select();

    if(error) console.error(error);
}

export async function insertArtistGenres(genres: Genre[]){
    if(genres.length === 0) return;

    const genresUniqArtistId = genres.filter((elem, i, self) => i === self.findIndex(genre => genre.artist_id === elem.artist_id));
    const formattedGenres = genresUniqArtistId.map(genre => { return {"genre_name": genre.name, "artist_id": genre.artist_id}});

    const {error} = await supabase
        .from("artist_genres")
        .insert(formattedGenres)
        .select();

    if(error) throw error;    
}

export async function insertMoods(tracks: mood[]){
    if(tracks.length === 0) return;

    const moodsWithUniqTrackId = tracks.filter((elem, i, self) => i === self.findIndex(track => track.id === elem.id));
    const formatted = moodsWithUniqTrackId.map(track => {return {"song_id": track.id, "moods": track.moods}});
    const dbFormatted = []

    for(const formattedTrack of formatted){
        for(let i = 0; i < 2; i++){
            dbFormatted.push({
                "song_id": formattedTrack.song_id,
                "mood_type": formattedTrack.moods[i]
            });
        }
    }

    const ids = dbFormatted.map(track => track.song_id);

    const {data: existingTrackMoods, error: fetchError } = await supabase
        .from("song_moods")
        .select("song_id")
        .in("song_id", ids);

    if(fetchError) throw fetchError;

    const shouldInsert = [];

    for(const track of dbFormatted){
        const exists = existingTrackMoods.some(existingTrackMood => existingTrackMood.song_id === track.song_id);
        if(!exists) shouldInsert.push(track);
    }

    if(shouldInsert.length === 0) return;

    const {error} = await supabase
        .from("song_moods")
        .insert(shouldInsert);
        
    if(error) throw error;
}

export async function getArtistsWithCountryData(artists: Artist[]): Promise<Artist[] | undefined>{
    if(artists.length === 0) return;

    const artistIds = artists.map(artist => artist.id);

    const {data: existingArtists, error: fetchError } = await supabase
        .from("artist")
        .select("*")
        .in("id", artistIds);

    const artistWithCountry: Artist[] = [];

    if(fetchError) throw fetchError; 

    for(const artist of existingArtists){
        if(artist.country !== null){            
            artistWithCountry.push(artist);
        }
        else{
            switch(artist.country_tries){
                case null:
                    artist.country_tries = 1;
                    await updateCountryTriesCounter(artist);
                    break;
                case 1:
                    artist.country_tries++;
                    await updateCountryTriesCounter(artist);
                    break;
                case 2:
                    artistWithCountry.push(artist);
                    break;
                default:
                    console.error("value not valid");
                    break;
            }
        }
    }

    return artistWithCountry;
}

export async function getSongMoodData(songs: Song[]): Promise<any>{
    if(songs.length === 0) return;

    const songIds = songs.map(song => song.id);
    
    const {data: existingSongMoods, error: fetchError} = await supabase
        .from("song_moods")
        .select("*")
        .in("song_id", songIds)
        
    if(fetchError) throw fetchError;

    const result = [];
    const map = new Map();

    for (const { song_id, mood_type } of existingSongMoods) {
        if (!map.has(song_id)) {
            map.set(song_id, []);
        }

        map.get(song_id).push(mood_type);
    }

    for (const [song_id, moods] of map.entries()) {
        result.push({ song_id, moods });
    }

    
    return result.map(item => { return {"id": item.song_id, "moods": item.moods}}); 
}

export async function updateArtistCountry(artist: Artist){
    const {error: fetchError } = await supabase
        .from("artist")
        .update({country: artist.country})
        .eq("id", artist.id);

    if(fetchError) throw fetchError; 
}

export async function updateCountryTriesCounter(artist: Artist){
    const {error: fetchError } = await supabase
        .from("artist")
        .update({country_tries: artist.country_tries})
        .eq("id", artist.id);

    if(fetchError) throw fetchError; 
}

export async function supabaseSetup(): Promise<any>{

    const resource = await supabase
        .from("mood")
        .insert([{ 
            type: "Calm"
        }])
        .select();


    if (resource.error) {
        console.error(resource.error);
    }
}