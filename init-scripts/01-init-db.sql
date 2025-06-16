-- DigiNativa Runtime Engine - Database Initialization
-- PostgreSQL schema for analytics and user data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS games;

-- Users table for authentication (when implemented)
CREATE TABLE IF NOT EXISTS users.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE NOT NULL, -- SSO integration
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    municipality VARCHAR(255), -- Swedish municipality
    role VARCHAR(50) DEFAULT 'user', -- user, admin, super_admin
    accessibility_preferences JSONB DEFAULT '{}',
    language_preference VARCHAR(10) DEFAULT 'sv',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Game sessions for analytics
CREATE TABLE IF NOT EXISTS analytics.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users.profiles(id) ON DELETE CASCADE,
    game_id VARCHAR(255) NOT NULL,
    scene_id VARCHAR(255),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    metadata JSONB DEFAULT '{}', -- Game-specific data
    device_type VARCHAR(50), -- mobile, tablet, desktop
    user_agent TEXT,
    ip_address INET,
    municipality VARCHAR(255)
);

-- User interactions for detailed analytics
CREATE TABLE IF NOT EXISTS analytics.user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES analytics.game_sessions(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL, -- click, choice, completion, etc.
    target_element VARCHAR(255),
    interaction_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER -- Time to respond to interaction
);

-- Performance metrics for monitoring
CREATE TABLE IF NOT EXISTS analytics.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20), -- ms, bytes, count, percent
    municipality VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Game manifests cache table
CREATE TABLE IF NOT EXISTS games.manifests (
    game_id VARCHAR(255) PRIMARY KEY,
    manifest_data JSONB NOT NULL,
    version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON analytics.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON analytics.game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON analytics.game_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_game_sessions_municipality ON analytics.game_sessions(municipality);

CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON analytics.user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON analytics.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON analytics.user_interactions(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON analytics.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON analytics.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_municipality ON analytics.performance_metrics(municipality);

CREATE INDEX IF NOT EXISTS idx_users_profiles_external_id ON users.profiles(external_id);
CREATE INDEX IF NOT EXISTS idx_users_profiles_municipality ON users.profiles(municipality);

-- Create views for common analytics queries
CREATE OR REPLACE VIEW analytics.daily_usage AS
SELECT 
    DATE(session_start) as date,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(duration_seconds) as avg_duration,
    municipality
FROM analytics.game_sessions 
WHERE session_start >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(session_start), municipality
ORDER BY date DESC;

CREATE OR REPLACE VIEW analytics.game_performance AS
SELECT 
    game_id,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT user_id) as unique_players,
    AVG(duration_seconds) as avg_duration,
    AVG(score) as avg_score,
    COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*) as completion_rate,
    municipality
FROM analytics.game_sessions 
GROUP BY game_id, municipality;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_profiles_updated_at 
    BEFORE UPDATE ON users.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_manifests_updated_at 
    BEFORE UPDATE ON games.manifests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for production)
GRANT USAGE ON SCHEMA analytics TO diginativa;
GRANT USAGE ON SCHEMA users TO diginativa;
GRANT USAGE ON SCHEMA games TO diginativa;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO diginativa;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA users TO diginativa;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA games TO diginativa;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA analytics TO diginativa;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA users TO diginativa;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA games TO diginativa;