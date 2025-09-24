export interface Song{
    id?: number;
    artist_id?: number;
    title: string;
    popularity: number;
    duration: number;
    explicit: boolean;
    link: string;
    moods?: string[];
    genres?: string[];
}

export interface Artist{
    id?: number;
    name: string;
    link: string;
    image?: string;
    popularity?: number;
    country?: string;
}

export interface Album{
    id?: number;
    name: string;
    image: string;
    link: string;
    release_year: number;
    total_tracks: number;
}