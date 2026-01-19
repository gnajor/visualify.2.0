CREATE TABLE IF NOT EXISTS Artist (
    id VARCHAR(22) PRIMARY KEY,
    name TEXT NOT NULL,
    link TEXT NOT NULL, 
    image TEXT,
    popularity INT,
    country VARCHAR(100),
    country_tries INT
);

CREATE TABLE IF NOT EXISTS Album (
    id VARCHAR(22) PRIMARY KEY,
    artist_id VARCHAR(22) NOT NULL REFERENCES Artist(id) ON DELETE CASCADE,
    image TEXT NOT NULL,
    release_year INT NOT NULL,
    name TEXT NOT NULL,
    link TEXT NOT NULL,
    total_tracks INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Song (
    id VARCHAR(22) PRIMARY KEY,
    artist_id VARCHAR(22) NOT NULL REFERENCES Artist(id) ON DELETE CASCADE,
    album_id VARCHAR(22) NOT NULL references Album(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    popularity INT NOT NULL,
    link TEXT NOT NULL,
    duration INT NOT NULL,
    explicit BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS Mood (
    type VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Genre (
    name VARCHAR(100) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Song_moods (
    mood_type VARCHAR(50) NOT NULL REFERENCES Mood(type) ON DELETE CASCADE,
    song_id VARCHAR(22) NOT NULL REFERENCES Song(id) ON DELETE CASCADE,
    PRIMARY KEY (mood_type, song_id)
);

CREATE TABLE IF NOT EXISTS artist_genres (
    genre_name VARCHAR(100) NOT NULL REFERENCES Genre(name) ON DELETE CASCADE,
    artist_id VARCHAR(22) NOT NULL REFERENCES Artist(id) ON DELETE CASCADE,
    PRIMARY KEY (genre_name, artist_id)
);