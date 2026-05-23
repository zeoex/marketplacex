-- MarketPlaceX — PostgreSQL Init
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Full-text search config
CREATE TEXT SEARCH CONFIGURATION marketplacex (COPY = pg_catalog.english);
ALTER TEXT SEARCH CONFIGURATION marketplacex ALTER MAPPING FOR hword, hword_part, word WITH unaccent, english_stem;
