CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  dob DATE,
  gender VARCHAR(10),
  address TEXT,
  first_release_year INTEGER,
  no_of_albums_released INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);