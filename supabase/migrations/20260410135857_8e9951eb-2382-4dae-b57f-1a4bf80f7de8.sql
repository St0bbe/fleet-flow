
-- Table for real-time driver locations
CREATE TABLE public.driver_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(driver_id)
);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all driver locations"
  ON public.driver_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can upsert own location"
  ON public.driver_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can update own location"
  ON public.driver_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Table for mission stages (transfer missions)
CREATE TABLE public.mission_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  origin text NOT NULL,
  destination text NOT NULL,
  eta timestamp with time zone,
  arrival_time timestamp with time zone,
  departure_time timestamp with time zone,
  receptive text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all stages"
  ON public.mission_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all stages"
  ON public.mission_stages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can manage own mission stages"
  ON public.mission_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.missions m
      JOIN public.drivers d ON d.id = m.driver_id
      WHERE m.id = mission_stages.mission_id AND d.user_id = auth.uid()
    )
  );

-- Add mission_type column to missions
ALTER TABLE public.missions ADD COLUMN mission_type text NOT NULL DEFAULT 'standard';

-- Enable realtime for mission_stages
ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_stages;

-- Trigger for updated_at on mission_stages
CREATE TRIGGER update_mission_stages_updated_at
  BEFORE UPDATE ON public.mission_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
