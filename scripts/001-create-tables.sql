CREATE TABLE IF NOT EXISTS photographer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  camera_equipment TEXT[] NOT NULL,
  hourly_rate NUMERIC(10,2) NOT NULL,
  availability_status VARCHAR(20) NOT NULL,
  rating NUMERIC(3,2) NOT NULL,
  total_reviews INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photography_type VARCHAR(100),
  duration_hours INT,
  budget NUMERIC(10,2),
  currency VARCHAR(3),
  job_date DATE,
  job_time TIME,
  location TEXT,
  transportation_fee BOOLEAN DEFAULT FALSE,
  status VARCHAR(20),
  is_urgent BOOLEAN DEFAULT FALSE,
  is_collaboration BOOLEAN DEFAULT FALSE,
  photographers_needed INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  location TEXT,
  project_date DATE,
  images TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
