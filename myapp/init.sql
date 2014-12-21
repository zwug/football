CREATE TABLE football_club
(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(40) NOT NULL
);
CREATE TABLE football_club_id_seq
(
    sequence_name VARCHAR NOT NULL,
    last_value BIGINT NOT NULL,
    start_value BIGINT NOT NULL,
    increment_by BIGINT NOT NULL,
    max_value BIGINT NOT NULL,
    min_value BIGINT NOT NULL,
    cache_value BIGINT NOT NULL,
    log_cnt BIGINT NOT NULL,
    is_cycled BOOL NOT NULL,
    is_called BOOL NOT NULL
);
CREATE TABLE goals
(
    id SERIAL PRIMARY KEY NOT NULL,
    minute INT NOT NULL,
    is_penalty BOOL DEFAULT false,
    is_own BOOL DEFAULT false,
    individual_id INT
);
CREATE TABLE goals_id_seq
(
    sequence_name VARCHAR NOT NULL,
    last_value BIGINT NOT NULL,
    start_value BIGINT NOT NULL,
    increment_by BIGINT NOT NULL,
    max_value BIGINT NOT NULL,
    min_value BIGINT NOT NULL,
    cache_value BIGINT NOT NULL,
    log_cnt BIGINT NOT NULL,
    is_cycled BOOL NOT NULL,
    is_called BOOL NOT NULL
);
CREATE TABLE individual
(
    id SERIAL PRIMARY KEY NOT NULL,
    player_id INT NOT NULL,
    match_id INT NOT NULL,
    rating REAL DEFAULT 0,
    red_cards INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    in_host_team BOOL DEFAULT false NOT NULL
);
CREATE TABLE individual_id_seq
(
    sequence_name VARCHAR NOT NULL,
    last_value BIGINT NOT NULL,
    start_value BIGINT NOT NULL,
    increment_by BIGINT NOT NULL,
    max_value BIGINT NOT NULL,
    min_value BIGINT NOT NULL,
    cache_value BIGINT NOT NULL,
    log_cnt BIGINT NOT NULL,
    is_cycled BOOL NOT NULL,
    is_called BOOL NOT NULL
);
CREATE TABLE match
(
    id SERIAL PRIMARY KEY NOT NULL,
    date DATE,
    guest_team_id INT NOT NULL,
    host_team_id INT NOT NULL,
    tournament VARCHAR(50) NOT NULL,
    host_win CHAR(3)
);
CREATE TABLE match_id_seq
(
    sequence_name VARCHAR NOT NULL,
    last_value BIGINT NOT NULL,
    start_value BIGINT NOT NULL,
    increment_by BIGINT NOT NULL,
    max_value BIGINT NOT NULL,
    min_value BIGINT NOT NULL,
    cache_value BIGINT NOT NULL,
    log_cnt BIGINT NOT NULL,
    is_cycled BOOL NOT NULL,
    is_called BOOL NOT NULL
);
CREATE TABLE player
(
    id SERIAL PRIMARY KEY NOT NULL,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthdate DATE NOT NULL,
    football_club_id INT NOT NULL,
    country VARCHAR(60) NOT NULL,
    national_team_id INT,
    goals_scored INT DEFAULT 0,
    matches_played INT DEFAULT 0
);
CREATE TABLE player_id_seq
(
    sequence_name VARCHAR NOT NULL,
    last_value BIGINT NOT NULL,
    start_value BIGINT NOT NULL,
    increment_by BIGINT NOT NULL,
    max_value BIGINT NOT NULL,
    min_value BIGINT NOT NULL,
    cache_value BIGINT NOT NULL,
    log_cnt BIGINT NOT NULL,
    is_cycled BOOL NOT NULL,
    is_called BOOL NOT NULL
);
ALTER TABLE goals ADD FOREIGN KEY (individual_id) REFERENCES individual (id);
ALTER TABLE individual ADD FOREIGN KEY (match_id) REFERENCES match (id);
ALTER TABLE individual ADD FOREIGN KEY (player_id) REFERENCES player (id);
ALTER TABLE match ADD FOREIGN KEY (guest_team_id) REFERENCES football_club (id);
ALTER TABLE match ADD FOREIGN KEY (host_team_id) REFERENCES football_club (id);
ALTER TABLE player ADD FOREIGN KEY (football_club_id) REFERENCES football_club (id);
ALTER TABLE player ADD FOREIGN KEY (national_team_id) REFERENCES football_club (id);

