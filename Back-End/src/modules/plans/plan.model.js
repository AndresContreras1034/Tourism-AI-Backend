export const createPlansTable = `
CREATE TABLE IF NOT EXISTS plans (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               VARCHAR(200) NOT NULL,
  description         TEXT,
  price               NUMERIC(10,2),
  activities          TEXT[],
  location_suggestion VARCHAR(150),
  source              VARCHAR(20) DEFAULT 'ai', -- ai | mock | manual
  tokens_used         INTEGER DEFAULT 0,
  created_at          TIMESTAMP DEFAULT NOW()
);
`;

console.log("🧱 [PLAN MODEL] Schema definido");