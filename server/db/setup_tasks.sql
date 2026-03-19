-- Create tasks table for calendar events
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'Video Call', 'In-Person', 'Training', 'Nutrition', 'Internal', etc.
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration TEXT, -- '30m', '1h', etc.
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Managers can manage their own tasks"
ON public.tasks FOR ALL
USING (auth.uid() = manager_id);

CREATE POLICY "Clients can view their own tasks"
ON public.tasks FOR SELECT
USING (auth.uid() = client_id);

-- Trigger for updated_at
CREATE TRIGGER on_tasks_updated
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
