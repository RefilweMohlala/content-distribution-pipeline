CREATE TABLE IF NOT EXISTS execution_log (
    id SERIAL PRIMARY KEY,
    notion_page_id TEXT NOT NULL,
    title TEXT,
    status TEXT NOT NULL,
    llm_provider TEXT DEFAULT 'anthropic',
    linkedin_queued BOOLEAN DEFAULT FALSE,
    twitter_queued BOOLEAN DEFAULT FALSE,
    instagram_queued BOOLEAN DEFAULT FALSE,
    youtube_queued BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    processed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_execution_log_notion_page_id ON execution_log(notion_page_id);