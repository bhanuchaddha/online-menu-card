-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable RLS on all tables
ALTER DATABASE postgres SET row_security = on;

-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    restaurant_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    extracted_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create restaurants table  
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_created_at ON menus(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for menus table
CREATE POLICY "Users can view their own menus" ON menus
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own menus" ON menus
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own menus" ON menus
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own menus" ON menus
    FOR DELETE USING (user_id = auth.uid()::text);

-- Create RLS policies for restaurants table
CREATE POLICY "Users can view their own restaurants" ON restaurants
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own restaurants" ON restaurants
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own restaurants" ON restaurants
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own restaurants" ON restaurants
    FOR DELETE USING (user_id = auth.uid()::text);

-- Allow public read access to restaurants for public menu pages
CREATE POLICY "Public can view restaurants" ON restaurants
    FOR SELECT USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample menu for testing (optional)
-- INSERT INTO menus (user_id, restaurant_name, image_url, extracted_data) VALUES (
--     'test-user-id',
--     'Sample Restaurant', 
--     'https://example.com/menu.jpg',
--     '{"restaurant_name": "Sample Restaurant", "categories": [{"name": "Main Dishes", "items": [{"name": "Pasta", "price": "12.99", "description": "Delicious pasta"}]}]}'
-- );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
