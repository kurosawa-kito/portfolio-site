-- eBay自動化ツール専用データベーススキーマ
-- タスク管理ツールとは完全に分離

-- ユーザーテーブル（eBay自動化ツール専用）
CREATE TABLE ebay_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
    trial_ends_at TIMESTAMP WITH TIME ZONE
);

-- ユーザー設定テーブル
CREATE TABLE ebay_user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ebay_users(id) ON DELETE CASCADE,
    default_profit_rate DECIMAL(5,2) DEFAULT 30.00,
    default_shipping_cost DECIMAL(10,2) DEFAULT 500.00,
    default_handling_time INTEGER DEFAULT 3,
    default_return_policy TEXT DEFAULT '30日以内返品可',
    default_category VARCHAR(100) DEFAULT 'Consumer Electronics',
    default_condition VARCHAR(50) DEFAULT 'Used',
    auto_relist BOOLEAN DEFAULT false,
    max_relist_times INTEGER DEFAULT 3,
    price_monitoring BOOLEAN DEFAULT false,
    price_adjustment_rate DECIMAL(5,2) DEFAULT 5.00,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- eBay認証情報テーブル
CREATE TABLE ebay_auth_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ebay_users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    ebay_user_id VARCHAR(100),
    is_sandbox BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 出品履歴テーブル
CREATE TABLE ebay_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ebay_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    mercari_url TEXT,
    mercari_price DECIMAL(10,2),
    ebay_item_id VARCHAR(50),
    ebay_url TEXT,
    ebay_price DECIMAL(10,2),
    profit DECIMAL(10,2),
    shipping_cost DECIMAL(10,2),
    category VARCHAR(100),
    condition VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'ended', 'cancelled')),
    listed_at TIMESTAMP WITH TIME ZONE,
    sold_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- リサーチ履歴テーブル
CREATE TABLE ebay_research_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ebay_users(id) ON DELETE CASCADE,
    search_url TEXT NOT NULL,
    profit_rate DECIMAL(5,2),
    shipping_cost DECIMAL(10,2),
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- セッションテーブル（eBay自動化ツール専用）
CREATE TABLE ebay_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ebay_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_ebay_users_email ON ebay_users(email);
CREATE INDEX idx_ebay_users_username ON ebay_users(username);
CREATE INDEX idx_ebay_listings_user_id ON ebay_listings(user_id);
CREATE INDEX idx_ebay_listings_status ON ebay_listings(status);
CREATE INDEX idx_ebay_listings_created_at ON ebay_listings(created_at);
CREATE INDEX idx_ebay_sessions_token ON ebay_sessions(session_token);
CREATE INDEX idx_ebay_sessions_user_id ON ebay_sessions(user_id);
