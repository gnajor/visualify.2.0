import { Artist, Genre } from "./interfaces.ts";

export function formatGenres(artists: Artist[]){
    const genres: Genre[] = [];

    artists.forEach(artist => {
        if(artist.genres && artist.genres.length > 0){
            artist.genres.forEach(genre => {
                genres.push({
                    "name": genre,
                    "artist_id": artist.id
                });
            });
        }
    });

    return genres;
}