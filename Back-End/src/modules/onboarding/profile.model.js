// profile model
export const createProfilesTable = `
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,

  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  origin_city VARCHAR(100),
  budget VARCHAR(20),
  travel_type VARCHAR(50),
  climate VARCHAR(20),
  
  interests TEXT[], 
  companions VARCHAR(50),
  duration VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

console.log("🧱 [PROFILE MODEL] Schema definido");