-- Create advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active advertisements" ON public.advertisements
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own advertisements" ON public.advertisements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create advertisements" ON public.advertisements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advertisements" ON public.advertisements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advertisements" ON public.advertisements
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_advertisements_category ON public.advertisements(category);
CREATE INDEX idx_advertisements_subcategory ON public.advertisements(subcategory);
CREATE INDEX idx_advertisements_user_id ON public.advertisements(user_id);
CREATE INDEX idx_advertisements_status ON public.advertisements(status);
CREATE INDEX idx_advertisements_created_at ON public.advertisements(created_at DESC);
