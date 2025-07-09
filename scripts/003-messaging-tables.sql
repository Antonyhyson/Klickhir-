-- Create user violations table for abuse tracking
CREATE TABLE IF NOT EXISTS user_violations (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  violation_count INTEGER DEFAULT 0,
  ban_until TIMESTAMP NULL,
  last_violation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update messages table to support encryption
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS encryption_key_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT true;

-- Create conversation keys table for E2E encryption
CREATE TABLE IF NOT EXISTS conversation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  encryption_key_hash VARCHAR(255) NOT NULL, -- Hashed version for verification
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_1, participant_2)
);

-- Create abuse reports table
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_violations_user_id ON user_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_violations_ban_until ON user_violations(ban_until);
CREATE INDEX IF NOT EXISTS idx_conversation_keys_participants ON conversation_keys(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_reported_user ON abuse_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status);
