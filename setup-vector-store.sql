-- Setup Vector Store for Restaurant Chatbot
-- Run this in your Supabase SQL Editor

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for restaurant and menu data
CREATE TABLE IF NOT EXISTS restaurant_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'restaurant_info', 'menu_item', 'category'
    metadata JSONB DEFAULT '{}',
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_embeddings_restaurant_id ON restaurant_embeddings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_embeddings_content_type ON restaurant_embeddings(content_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_embeddings_embedding ON restaurant_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE restaurant_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for embeddings table
-- Allow public read access for chatbot queries
CREATE POLICY "Public can view restaurant embeddings" ON restaurant_embeddings
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete embeddings
CREATE POLICY "Authenticated users can manage embeddings" ON restaurant_embeddings
    FOR ALL USING (auth.role() = 'authenticated');

-- Create a function to search similar embeddings
CREATE OR REPLACE FUNCTION search_restaurants(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    restaurant_id UUID,
    content TEXT,
    content_type TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        restaurant_embeddings.id,
        restaurant_embeddings.restaurant_id,
        restaurant_embeddings.content,
        restaurant_embeddings.content_type,
        restaurant_embeddings.metadata,
        1 - (restaurant_embeddings.embedding <=> query_embedding) AS similarity
    FROM restaurant_embeddings
    WHERE 1 - (restaurant_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY restaurant_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create a function to get restaurant details with embeddings
CREATE OR REPLACE FUNCTION get_restaurant_with_context(restaurant_ids UUID[])
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    slug TEXT,
    latitude FLOAT,
    longitude FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.description,
        r.address,
        r.phone,
        r.website,
        r.slug,
        r.latitude,
        r.longitude
    FROM restaurants r
    WHERE r.id = ANY(restaurant_ids);
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_restaurant_embeddings_updated_at 
    BEFORE UPDATE ON restaurant_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON restaurant_embeddings TO anon;
GRANT ALL ON restaurant_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION search_restaurants TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_restaurant_with_context TO anon, authenticated;
