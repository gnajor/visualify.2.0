export interface Song{
    id: string;
    artist_id?: string;
    album_id?: string;
    title: string;
    popularity: number;
    duration: number;
    explicit: boolean;
    link: string;
    moods?: string[];
    genres?: string[];
}

export interface Artist{
    id: string;
    name?: string;
    link?: string;
    image?: string;
    popularity?: number;
    country?: string;
    genres?: string[];
    country_tries?: string;
}

export interface Album{
    id?: string;
    artist_id?: string;
    name: string;
    image: string;
    link: string;
    release_year: number;
    total_tracks: number;
}

export interface Genre{
    name?: string,
    artist_id?: string,
}