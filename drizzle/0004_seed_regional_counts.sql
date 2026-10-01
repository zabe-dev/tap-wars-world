INSERT INTO regional_counts (country_code, region, tap_count) VALUES
('PH', 'Bulacan', 10), ('PH', 'Pampanga', 9), ('PH', 'Zambales', 8), ('PH', 'Cavite', 7), ('PH', 'Laguna', 6), ('PH', 'Rizal', 5), ('PH', 'Batangas', 4), ('PH', 'Cebu', 3), ('PH', 'Iloilo', 2), ('PH', 'Davao del Sur', 1),
('US', 'California', 10), ('US', 'Texas', 9), ('US', 'Florida', 8), ('US', 'New York', 7), ('US', 'Pennsylvania', 6), ('US', 'Illinois', 5), ('US', 'Ohio', 4), ('US', 'Georgia', 3), ('US', 'North Carolina', 2), ('US', 'Michigan', 1)
ON CONFLICT (country_code, region) DO NOTHING;
