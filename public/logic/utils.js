import { apiCom } from "../apiCom/apiCom.js";
import { State } from "../index.js";

export async function getAllTopUserDataAndSetState(){
    const ranges = ["short_term", "medium_term", "long_term"];
    const types = ["artists", "tracks"];
    const promises = [];
    const offset = 50;
    const amount = 100;

    const fetchWithContext = async (range, type, offset) => {
        const resource = await apiCom("data:get-top-user-data", { range, type, offset });
        return { type, range, resource };
    };

    for(const type of types){
        for(const range of ranges){
            for(let i = 0; i < amount/offset; i++){
                promises.push(
                    fetchWithContext(range, type, offset * i)
                );   
            }
        }
    }

    const results = await Promise.all(promises);

    for(const result of results){
        if(State.userData[result.type][result.range] !== null){
            State.userData[result.type][result.range] = State.userData[result.type][result.range].concat(result.resource);
        }
        else{
            State.userData[result.type][result.range] = result.resource;
        }
    }
}

export function getDecadeData(){
    const decades = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950];
    const timeTerms = Object.keys(State.userData.tracks);
    const formatted = {};

    timeTerms.forEach((timeTerm, i) => {
        const songData = State.userData.tracks[timeTerm];
        formatted[timeTerm] = [];

        for(const decade of decades){
            const decadefiltered = songData.filter(item => String(decade).slice(0, 3) === String(item.album.release_date).slice(0, 3));
            const obj = {
                decade,
                amount: decadefiltered.length,
                topArtist: false,
                image: false,
                songName: false,

            }
            if(decadefiltered.length !== 0){
                obj.topArtist = decadefiltered[0].artists[0].name;
                obj.image = decadefiltered[0].album.images[0].url;
                obj.songName = decadefiltered[0].name;
            }

            formatted[timeTerm].push(obj); 
        }
        //for the blank space in the decadeDiagram
        formatted[timeTerm].push({
            decade: false,
            amount: false,
        })
    });
    return formatted;
}

export function getMostPlayedData(){
    const ranges = Object.keys(State.userData.artists);
    const formatted = {}
    const amount = 50;

    formatted.artists = {};
    formatted.tracks = {};
        
    for(const range of ranges){
        formatted.artists[range] = State.userData.artists[range].map((artist, i) => {
            return {
                name: artist.name,
                image: artist.images[0].url,
                popularity: artist.popularity,
                ranking: i + 1
            }
        });

        formatted.tracks[range] = State.userData.tracks[range].map((track, i) => {
            return {
                name: track.name,
                image: track.album.images[0].url,
                popularity: track.popularity,
                ranking: i + 1,
            }
        });

        formatted.artists[range].slice(0, 50);
        formatted.tracks[range].slice(0, 50);
    }
    return formatted;
}

export function getGenreData(){
    const ranges = Object.keys(State.userData.artists);
    const formatted = {};

    for(const range of ranges){
        const genres = [];

        for(const artist of State.userData.artists[range]){
            artist.genres.forEach((genre) => {
                const exists = genres.find(genreItem => genreItem.genre === genre);

                if(exists){
                    exists.value++;
                }
                else{
                    genres.push({
                        genre,
                        "value": 1
                    })
                }
            });
        }

        formatted[range] = genres;
    }
    
    console.log(formatted)
}

export function formatSongs(songName){

    if(songName.includes("(")){
        songName = songName.split("(")[0];
    }

    if(songName.includes(" - ")){
        songName = songName.split(" -")[0];
    }
    
    return songName;

}