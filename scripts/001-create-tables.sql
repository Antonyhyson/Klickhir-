-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'photographer')),
  location_country VARCHAR(2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  mfa_method VARCHAR(20) NOT NULL CHECK (mfa_method IN ('authenticator', 'sms')),
  mfa_secret VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- NEW: Add for password reset functionality
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_photographers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  photographer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, photographer_id) -- A client can save a photographer only once
);

-- Create saved jobs table (for photographers to save jobs)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(photographer_id, job_id) -- A photographer can save a job only once
);

-- Add indexes for better performance on new tables
CREATE INDEX IF NOT EXISTS idx_saved_photographers_client_id ON saved_photographers(client_id);
CREATE INDEX IF NOT EXISTS idx_saved_photographers_photographer_id ON saved_photographers(photographer_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_photographer_id ON saved_jobs(photographer_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);