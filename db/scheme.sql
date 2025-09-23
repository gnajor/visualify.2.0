CREATE TABLE IF NOT EXISTS Song(
    id SERIAL PRIMARY KEY,
    artist_id INT NOT NULL
    title VARCHAR(200) NOT NULL,
    image TEXT NOT NULL,
    year INT NOT NULL,
    popularity INT NOT NULL,

    artist_id REFERENCES Artist(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Artist(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    image TEXT NOT NULL,
    popularity INT NOT NULL,
    country VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Mood(
    type VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Genre(
    name VARCHAR(100) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Song_moods(
    mood_type VARCHAR(50),
    song_id INT,

    song_id REFERENCES Song(id) ON DELETE CASCADE,
    mood_type REFERENCES Mood(type) ON DELETE CASCADE,
    PRIMARY KEY(mood_type, song_id)
);

CREATE TABLE IF NOT EXISTS Song_genres(
    genre_name VARCHAR(100),
    song_id INT,

    song_id REFERENCES Song(id) ON DELETE CASCADE,
    mood_type REFERENCES Mood(type) ON DELETE CASCADE,
    PRIMARY KEY(mood_type, song_id)
);



