-- SQL Script to update test data for the MatchbookDB

USE MatchbookDB;

-- Check if we already have events data
SELECT COUNT(*) INTO @event_count FROM EventDetails;

-- Only insert events if none exist
IF @event_count = 0 THEN
    -- Inserting Event Data
    INSERT INTO EventDetails (EventName, Description, Location, RequiredSkills, Urgency, EventDate) VALUES 
    ('Food Drive 2023', 'Community food drive to collect non-perishable items for local food banks.', 'Community Center, Downtown', 'Logistics, Driving, Event Planning', 3, '2023-12-15'),
    ('Habitat Build Project', 'Constructing affordable housing for families in need.', '1234 Construction Site, North District', 'Construction, First Aid, Logistics', 4, '2023-12-20'),
    ('Senior Care Visit', 'Providing companionship and assistance to elderly residents.', 'Sunny Pines Retirement Home', 'Medical, Cooking, Administration', 2, '2023-12-10'),
    ('Youth Mentorship Program', 'Mentoring at-risk youth through educational and recreational activities.', 'City Youth Center', 'Teaching, Event Planning, Administration', 3, '2024-01-05'),
    ('Disaster Relief Training', 'Training session for volunteers to prepare for emergency response.', 'Fire Station #5', 'First Aid, Logistics, Medical', 5, '2023-12-05');
END IF;

-- Check if we already have user and volunteer data
SELECT COUNT(*) INTO @user_count FROM UserCredentials WHERE Email != 'admin@matchbook.com';

-- Only insert volunteer data if minimal exists
IF @user_count < 5 THEN
    -- Inserting User Credentials with proper password hashing
    INSERT INTO UserCredentials (Email, PasswordHash) VALUES 
    ('john@example.com', '$2b$10$LCXUm2VkFLK8b9uxAEuTaeqB1.4FJzxVsDl7q52YvPrK3r.nUroYK'), -- password123
    ('jane@example.com', '$2b$10$uTYGAh.FLeAcmVQ/JLXhMu2SfHuDOiMrSfmLtSlNdDAYupXYK61kW'), -- password456
    ('robert@example.com', '$2b$10$Cf7eHHUHJ9sQzsZ0ELAi0eMKCzjlJZyWcpMBKOBNfzl5mS.WVv6dG'), -- password789
    ('sarah@example.com', '$2b$10$QpgNBHWYFzZC6/YlT0Ei4e.Cs667WNRd5YoR0a4QZ6HUO1.gGq3YW'), -- password101
    ('michael@example.com', '$2b$10$hXnDcqIw/YP8KLKdh9bk7OMVPm/JQzxmmZfDpbwbXeIY.x4mTT3cC'); -- password112
    
    -- Get the IDs of the newly inserted users
    SELECT ID INTO @john_id FROM UserCredentials WHERE Email = 'john@example.com' LIMIT 1;
    SELECT ID INTO @jane_id FROM UserCredentials WHERE Email = 'jane@example.com' LIMIT 1;
    SELECT ID INTO @robert_id FROM UserCredentials WHERE Email = 'robert@example.com' LIMIT 1;
    SELECT ID INTO @sarah_id FROM UserCredentials WHERE Email = 'sarah@example.com' LIMIT 1;
    SELECT ID INTO @michael_id FROM UserCredentials WHERE Email = 'michael@example.com' LIMIT 1;
    
    -- Insert User Profiles
    INSERT INTO UserProfile (UserID, FullName, Address, City, State, Zipcode, Skills, Preferences, Availability, IsAdmin) VALUES 
    (@john_id, 'John Doe', '123 Elm St', 'New York', 'NY', '10001', 'First Aid, Cooking, Driving', 'Outdoor', '["2023-05-15","2023-05-16","2023-05-17","2023-12-15","2023-12-20"]', 0),
    (@jane_id, 'Jane Smith', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'Languages, Teaching, Organizing', 'Education', '["2023-06-20","2023-06-21","2023-12-10","2024-01-05"]', 0),
    (@robert_id, 'Robert Johnson', '789 Pine Blvd', 'Chicago', 'IL', '60007', 'Medical, IT Support, Construction', 'Healthcare', '["2023-04-10","2023-04-11","2023-12-05","2023-12-20"]', 0),
    (@sarah_id, 'Sarah Williams', '321 Cedar Lane', 'Houston', 'TX', '77002', 'Counseling, Leadership, Event Planning', 'Youth Services', '["2023-07-05","2023-07-06","2024-01-05"]', 0),
    (@michael_id, 'Michael Brown', '654 Birch Dr', 'Phoenix', 'AZ', '85001', 'Fundraising, Communication, Sports', 'Sports', '["2023-03-25","2023-03-26","2023-12-15"]', 0);
END IF;

-- Creating some additional sample event assignments
DELETE FROM VolunteerHistory WHERE VolunteerID > 0;

-- Get profile IDs for the volunteers
SELECT ID INTO @john_profile_id FROM UserProfile WHERE FullName = 'John Doe' LIMIT 1;
SELECT ID INTO @jane_profile_id FROM UserProfile WHERE FullName = 'Jane Smith' LIMIT 1;
SELECT ID INTO @robert_profile_id FROM UserProfile WHERE FullName = 'Robert Johnson' LIMIT 1;
SELECT ID INTO @sarah_profile_id FROM UserProfile WHERE FullName = 'Sarah Williams' LIMIT 1;
SELECT ID INTO @michael_profile_id FROM UserProfile WHERE FullName = 'Michael Brown' LIMIT 1;

-- Get some event IDs
SELECT EventID INTO @food_drive_id FROM EventDetails WHERE EventName = 'Food Drive 2023' LIMIT 1;
SELECT EventID INTO @habitat_build_id FROM EventDetails WHERE EventName = 'Habitat Build Project' LIMIT 1;
SELECT EventID INTO @senior_care_id FROM EventDetails WHERE EventName = 'Senior Care Visit' LIMIT 1;
SELECT EventID INTO @youth_mentor_id FROM EventDetails WHERE EventName = 'Youth Mentorship Program' LIMIT 1;
SELECT EventID INTO @disaster_relief_id FROM EventDetails WHERE EventName = 'Disaster Relief Training' LIMIT 1;

-- Create some volunteer history records
INSERT INTO VolunteerHistory (UserID, EventID, ParticipationDate) VALUES
(@john_profile_id, @food_drive_id, '2023-12-15 14:28:07'),
(@robert_profile_id, @habitat_build_id, '2023-12-20 09:15:22'),
(@jane_profile_id, @senior_care_id, '2023-12-10 10:45:33'),
(@sarah_profile_id, @youth_mentor_id, '2024-01-05 13:20:45'),
(@michael_profile_id, @food_drive_id, '2023-12-15 08:55:16');

-- Output the result
SELECT 'Test data update complete. Please check the tables to confirm the data has been inserted correctly.' AS Result; 