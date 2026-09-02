CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  country text NOT NULL,
  dial_code text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  status public.member_status NOT NULL DEFAULT 'pending',
  consent boolean NOT NULL DEFAULT false,
  admin_note text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX members_phone_unique ON public.members (dial_code, phone);
CREATE INDEX members_status_idx ON public.members (status);

GRANT INSERT ON public.members TO anon, authenticated;
GRANT SELECT (id, full_name, country, status, created_at) ON public.members TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a membership request" ON public.members
FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND consent = true);

CREATE POLICY "Public can view approved members" ON public.members
FOR SELECT TO anon USING (status = 'approved');

CREATE POLICY "Admins can view all members" ON public.members
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR status = 'approved');

CREATE POLICY "Admins can update members" ON public.members
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete members" ON public.members
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.folder_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  folder_name text NOT NULL DEFAULT 'COMMUNITY 1K FOLDER',
  contact_prefix text NOT NULL DEFAULT 'T.S',
  member_goal integer NOT NULL DEFAULT 1000,
  whatsapp_link text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.folder_settings TO anon, authenticated;
GRANT UPDATE ON public.folder_settings TO authenticated;
GRANT ALL ON public.folder_settings TO service_role;
ALTER TABLE public.folder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Folder settings are public" ON public.folder_settings
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can update folder settings" ON public.folder_settings
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.folder_settings (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  IF TG_TABLE_NAME = 'members' AND NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER members_touch BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER folder_settings_touch BEFORE UPDATE ON public.folder_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;
