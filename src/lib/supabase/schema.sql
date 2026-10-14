-- ====================================================================
-- AI CREATOR OS - POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (SUPABASE)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    niche TEXT NOT NULL DEFAULT 'Tech & AI Productivity',
    target_audience TEXT NOT NULL DEFAULT 'Solo-founders, developers, and tech creators',
    primary_platforms TEXT[] DEFAULT ARRAY['Instagram Reels', 'Instagram Carousels'],
    main_goals TEXT[] DEFAULT ARRAY['Audience Growth', 'Authority'],
    preferred_formats TEXT[] DEFAULT ARRAY['REELS', 'CAROUSEL'],
    posting_frequency_per_week INT DEFAULT 4,
    language TEXT DEFAULT 'English',
    speaking_style TEXT DEFAULT 'Direct, insightful, conversational',
    editing_limitations TEXT DEFAULT 'Fast cuts with clean typography, no complex 3D',
    available_filming_hours_per_week NUMERIC(4,1) DEFAULT 4.0,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Connected Instagram Accounts
CREATE TABLE IF NOT EXISTS public.connected_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL DEFAULT 'INSTAGRAM',
    instagram_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    account_name TEXT,
    profile_picture_url TEXT,
    account_type TEXT CHECK (account_type IN ('BUSINESS', 'CREATOR', 'PERSONAL_DEMO')),
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    media_count INT DEFAULT 0,
    access_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_instagram UNIQUE (user_id, instagram_user_id)
);

-- 4. Media Posts & Ingested Metrics
CREATE TABLE IF NOT EXISTS public.media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instagram_media_id TEXT NOT NULL,
    caption TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('REELS', 'CAROUSEL', 'IMAGE', 'STORY')),
    media_url TEXT,
    thumbnail_url TEXT,
    permalink TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    duration_seconds INT,
    views INT DEFAULT 0,
    reach INT DEFAULT 0,
    impressions INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    saves INT DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.00,
    topic TEXT,
    hook_type TEXT,
    call_to_action TEXT,
    ai_diagnostic JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_account_media UNIQUE (account_id, instagram_media_id)
);

-- 5. Daily Account Snapshots & Trends
CREATE TABLE IF NOT EXISTS public.daily_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reach INT DEFAULT 0,
    views INT DEFAULT 0,
    impressions INT DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.00,
    follower_growth INT DEFAULT 0,
    profile_views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_account_date UNIQUE (account_id, date)
);

-- 6. Content Ideas Library
CREATE TABLE IF NOT EXISTS public.content_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('REELS', 'CAROUSEL', 'IMAGE', 'STORY')),
    target_audience TEXT,
    hook TEXT,
    objective TEXT NOT NULL,
    estimated_filming_minutes INT DEFAULT 30,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Advanced')),
    source TEXT NOT NULL,
    status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'planned', 'script_ready', 'filming', 'editing', 'ready', 'scheduled', 'published')),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Script Studio Documents
CREATE TABLE IF NOT EXISTS public.scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.content_ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    hook_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_hook_index INT DEFAULT 0,
    spoken_script_short TEXT,
    spoken_script_long TEXT,
    current_spoken_script TEXT NOT NULL,
    shot_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    b_roll_suggestions TEXT[] DEFAULT ARRAY[]::TEXT[],
    on_screen_text_list TEXT[] DEFAULT ARRAY[]::TEXT[],
    caption TEXT,
    call_to_action TEXT,
    cover_title TEXT,
    structure_type TEXT,
    tone TEXT,
    estimated_duration_seconds INT DEFAULT 45,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'ready_for_filming', 'filmed')),
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Personal Voice & Style Profile
CREATE TABLE IF NOT EXISTS public.style_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    speaking_rhythm TEXT,
    sentence_length_preference TEXT DEFAULT 'punchy',
    humor_level INT DEFAULT 5,
    directness_score INT DEFAULT 8,
    vocabulary_traits TEXT[] DEFAULT ARRAY[]::TEXT[],
    signature_expressions TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_hook_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_ctas TEXT[] DEFAULT ARRAY[]::TEXT[],
    storytelling_angle TEXT,
    avoid_words TEXT[] DEFAULT ARRAY[]::TEXT[],
    sample_transcripts TEXT[] DEFAULT ARRAY[]::TEXT[],
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reel Video Analyses
CREATE TABLE IF NOT EXISTS public.video_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds NUMERIC(6,2),
    resolution TEXT,
    fps NUMERIC(5,2),
    aspect_ratio TEXT,
    transcript TEXT,
    hook_score INT,
    hook_critique TEXT,
    suggested_hooks TEXT[] DEFAULT ARRAY[]::TEXT[],
    narrative_sections JSONB DEFAULT '[]'::jsonb,
    clarity_score INT,
    repetition_detected TEXT[] DEFAULT ARRAY[]::TEXT[],
    core_takeaway TEXT,
    cta_placement_feedback TEXT,
    visual_variety_score INT,
    pacing_feedback TEXT,
    revised_script TEXT,
    b_roll_recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
    pre_publish_checklist JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Competitor References
CREATE TABLE IF NOT EXISTS public.competitor_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competitor_handle TEXT NOT NULL,
    post_url TEXT NOT NULL,
    media_type TEXT,
    visible_engagement JSONB,
    hook TEXT,
    topic TEXT,
    caption_excerpt TEXT,
    structural_breakdown TEXT,
    why_it_worked TEXT,
    content_opportunity TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Content Calendar Entries
CREATE TABLE IF NOT EXISTS public.content_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.content_ideas(id) ON DELETE SET NULL,
    script_id UUID REFERENCES public.scripts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    planned_date DATE NOT NULL,
    format TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    caption_preview TEXT,
    objective TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Performance Experiments (Hypotheses & A/B testing)
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    variable_tested TEXT NOT NULL,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    metric_observed TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Completed', 'Inconclusive')),
    findings TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 13. AI Recommendations Cache & Outcome Tracking
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    format TEXT NOT NULL,
    target_audience TEXT,
    objective TEXT NOT NULL,
    suggested_hook TEXT,
    main_argument TEXT,
    recommended_duration_seconds INT,
    suggested_cta TEXT,
    supporting_evidence TEXT,
    confidence_score INT,
    production_effort TEXT,
    status TEXT DEFAULT 'suggested',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_media_posts_account_timestamp ON public.media_posts (account_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_media_posts_user ON public.media_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_insights_account_date ON public.daily_insights (account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_content_ideas_user_status ON public.content_ideas (user_id, status);
CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON public.content_calendar (user_id, planned_date ASC);
CREATE INDEX IF NOT EXISTS idx_scripts_user ON public.scripts (user_id);

-- 15. ROW LEVEL SECURITY POLICIES (Data Isolation)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their connected accounts" ON public.connected_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their media posts" ON public.media_posts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their daily insights" ON public.daily_insights
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their content ideas" ON public.content_ideas
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their scripts" ON public.scripts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their style profiles" ON public.style_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their video analyses" ON public.video_analyses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their competitor references" ON public.competitor_references
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their content calendar" ON public.content_calendar
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their experiments" ON public.experiments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their AI recommendations" ON public.ai_recommendations
    FOR ALL USING (auth.uid() = user_id);
