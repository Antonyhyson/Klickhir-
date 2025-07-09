-- Insert sample users (passwords are hashed version of "password123")
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, user_type, location_country, currency, mfa_method, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Sarah', 'Johnson', '+1234567890', 'photographer', 'US', 'USD', 'authenticator', true),
('550e8400-e29b-41d4-a716-446655440002', 'michael.chen@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Michael', 'Chen', '+1234567891', 'photographer', 'US', 'USD', 'authenticator', true),
('550e8400-e29b-41d4-a716-446655440003', 'emma.rodriguez@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Emma', 'Rodriguez', '+1234567892', 'photographer', 'US', 'USD', 'sms', true),
('550e8400-e29b-41d4-a716-446655440004', 'david.kim@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'David', 'Kim', '+1234567893', 'photographer', 'US', 'USD', 'authenticator', true),
('550e8400-e29b-41d4-a716-446655440005', 'john.client@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'John', 'Client', '+1234567894', 'client', 'US', 'USD', 'authenticator', true);

-- Insert photographer profiles
INSERT INTO photographer_profiles (user_id, bio, specialties, camera_equipment, hourly_rate, availability_status, rating, total_reviews) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Professional wedding and portrait photographer with 8+ years of experience', ARRAY['Wedding', 'Portrait', 'Event'], ARRAY['DSLR Camera Kit', 'Wedding Photography Kit', 'Portrait Photography Kit'], 150.00, 'available', 4.9, 127),
('550e8400-e29b-41d4-a716-446655440002', 'Commercial and fashion photographer specializing in product photography', ARRAY['Commercial', 'Product', 'Fashion'], ARRAY['Mirrorless Camera Kit', 'Commercial Photography Kit', 'Studio Lighting Kit'], 200.00, 'busy', 4.8, 89),
('550e8400-e29b-41d4-a716-446655440003', 'Street and documentary photographer capturing authentic moments', ARRAY['Street', 'Documentary', 'Travel'], ARRAY['DSLR Camera Kit', 'Travel Photography Kit'], 120.00, 'available', 4.7, 156),
('550e8400-e29b-41d4-a716-446655440004', 'Family and maternity photographer creating lasting memories', ARRAY['Wedding', 'Family', 'Maternity'], ARRAY['DSLR Camera Kit', 'Portrait Photography Kit', 'Wedding Photography Kit'], 175.00, 'available', 4.9, 203);

-- Insert client profile
INSERT INTO client_profiles (user_id) VALUES
('550e8400-e29b-41d4-a716-446655440005');

-- Insert sample jobs
INSERT INTO jobs (id, client_id, title, description, photography_type, duration_hours, budget, currency, job_date, job_time, location, transportation_fee, status, is_urgent, is_collaboration, photographers_needed) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Wedding Photography - Central Park', 'Looking for an experienced wedding photographer for our outdoor ceremony in Central Park. We want natural, candid shots that capture the emotion of our special day.', 'Wedding Photography', 8, 2500.00, 'USD', '2024-12-20', '14:00:00', 'Central Park, New York, NY', false, 'open', false, false, 1),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Corporate Headshots', 'Need professional headshots for 15 employees. Studio setup preferred with clean, professional backgrounds.', 'Corporate Photography', 4, 800.00, 'USD', '2024-12-18', '10:00:00', 'Manhattan, New York, NY', true, 'open', true, false, 1),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Fashion Week Coverage', 'Large-scale fashion week coverage requiring multiple photographers for different venues and events.', 'Fashion Photography', 40, 15000.00, 'USD', '2025-02-10', '09:00:00', 'Multiple venues, New York, NY', true, 'open', false, true, 5);

-- Insert sample portfolio posts
INSERT INTO portfolio_posts (photographer_id, project_name, description, location, project_date, images) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah & Mike Wedding', 'Beautiful outdoor ceremony at Central Park with golden hour portraits', 'Central Park, NY', '2024-11-15', ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400']),
('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Headshots', 'Professional headshots for executive team', 'Manhattan, NY', '2024-11-10', ARRAY['/placeholder.svg?height=300&width=400']),
('550e8400-e29b-41d4-a716-446655440003', 'Brooklyn Street Art', 'Urban fashion photography in Brooklyn', 'Brooklyn, NY', '2024-11-05', ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400']);
