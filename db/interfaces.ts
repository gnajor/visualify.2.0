export interface Song{
    id?: number;
    artist_id: number;
    title: string;
    image: string;
    year: number;
    popularity: number;
    moods?: string[];
    genres?: string[];
}