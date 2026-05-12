
-- 1. user_roles: allow ngf_staff to manage roles
CREATE POLICY "roles ngf insert" ON public.user_roles
  FOR INSERT TO public
  WITH CHECK (public.has_role(auth.uid(), 'ngf_staff'));

CREATE POLICY "roles ngf update" ON public.user_roles
  FOR UPDATE TO public
  USING (public.has_role(auth.uid(), 'ngf_staff'))
  WITH CHECK (public.has_role(auth.uid(), 'ngf_staff'));

CREATE POLICY "roles ngf delete" ON public.user_roles
  FOR DELETE TO public
  USING (public.has_role(auth.uid(), 'ngf_staff'));

-- 2. profiles: allow insert by self (for signup trigger / safety)
CREATE POLICY "profiles self insert" ON public.profiles
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

-- 3. Auto-create profile on new signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
