-- ============================================================
-- Schema Completo do VaptVupt — Supabase
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  uid UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'provider')),
  phone TEXT,
  "photoUrl" TEXT,
  "pushToken" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.users FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.users FOR INSERT
  WITH CHECK ( auth.uid() = uid );

CREATE POLICY "Users can update own profile."
  ON public.users FOR UPDATE
  USING ( auth.uid() = uid );

-- ============================================================
-- TABELA: providers (Dados específicos do prestador)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.providers (
  uid UUID REFERENCES public.users(uid) NOT NULL PRIMARY KEY,
  categories TEXT[] DEFAULT '{}'::TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "basePrice" NUMERIC DEFAULT 0,
  available BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  "reviewCount" INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers are viewable by everyone."
  ON public.providers FOR SELECT
  USING ( true );

CREATE POLICY "Providers can insert their own data."
  ON public.providers FOR INSERT
  WITH CHECK ( auth.uid() = uid );

CREATE POLICY "Providers can update own data."
  ON public.providers FOR UPDATE
  USING ( auth.uid() = uid );

-- ============================================================
-- TABELA: provider_services (Anúncios de serviço do prestador)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.provider_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "providerId" UUID REFERENCES public.providers(uid) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone."
  ON public.provider_services FOR SELECT
  USING ( true );

CREATE POLICY "Providers can insert own services."
  ON public.provider_services FOR INSERT
  WITH CHECK ( auth.uid() = "providerId" );

CREATE POLICY "Providers can update own services."
  ON public.provider_services FOR UPDATE
  USING ( auth.uid() = "providerId" );

CREATE POLICY "Providers can delete own services."
  ON public.provider_services FOR DELETE
  USING ( auth.uid() = "providerId" );

-- ============================================================
-- TABELA: service_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "clientId" UUID REFERENCES public.users(uid) NOT NULL,
  "providerId" UUID REFERENCES public.providers(uid),
  "serviceType" TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'on_the_way', 'completed', 'canceled')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  "isUrgent" BOOLEAN DEFAULT false,
  "estimatedPrice" NUMERIC,
  "clientMessage" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own requests."
  ON public.service_requests FOR SELECT
  USING ( auth.uid() = "clientId" );

CREATE POLICY "Providers can view requests assigned to them."
  ON public.service_requests FOR SELECT
  USING ( auth.uid() = "providerId" OR "providerId" IS NULL );

CREATE POLICY "Clients can insert requests."
  ON public.service_requests FOR INSERT
  WITH CHECK ( auth.uid() = "clientId" );

CREATE POLICY "Users can update requests involved in."
  ON public.service_requests FOR UPDATE
  USING ( auth.uid() = "clientId" OR auth.uid() = "providerId" );

-- ============================================================
-- TABELA: reviews (Avaliações de serviços)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "requestId" UUID REFERENCES public.service_requests(id) NOT NULL,
  "clientId" UUID REFERENCES public.users(uid) NOT NULL,
  "providerId" UUID REFERENCES public.providers(uid) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Garantir apenas uma review por solicitação
  UNIQUE("requestId", "clientId")
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT
  USING ( true );

CREATE POLICY "Clients can insert reviews for their requests."
  ON public.reviews FOR INSERT
  WITH CHECK ( auth.uid() = "clientId" );

-- ============================================================
-- TRIGGER: Atualiza rating e reviewCount do provider ao inserir review
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.providers
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.reviews
      WHERE "providerId" = NEW."providerId"
    ),
    "reviewCount" = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE "providerId" = NEW."providerId"
    ),
    updated_at = now()
  WHERE uid = NEW."providerId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_rating();

-- ============================================================
-- TABELA: chats
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "requestId" UUID REFERENCES public.service_requests(id) NOT NULL,
  "clientId" UUID REFERENCES public.users(uid) NOT NULL,
  "providerId" UUID REFERENCES public.providers(uid) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved users can view chat."
  ON public.chats FOR SELECT
  USING ( auth.uid() = "clientId" OR auth.uid() = "providerId" );

CREATE POLICY "Involved users can insert chat."
  ON public.chats FOR INSERT
  WITH CHECK ( auth.uid() = "clientId" OR auth.uid() = "providerId" );

-- ============================================================
-- TABELA: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "chatId" UUID REFERENCES public.chats(id) NOT NULL,
  "senderId" UUID REFERENCES public.users(uid) NOT NULL,
  "senderName" TEXT NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved users can view messages."
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = messages."chatId"
      AND (c."clientId" = auth.uid() OR c."providerId" = auth.uid())
    )
  );

CREATE POLICY "Involved users can insert messages."
  ON public.messages FOR INSERT
  WITH CHECK ( auth.uid() = "senderId" );

CREATE POLICY "Involved users can update messages (read)."
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = messages."chatId"
      AND (c."clientId" = auth.uid() OR c."providerId" = auth.uid())
    )
  );

-- ============================================================
-- HABILITAR REALTIME nas tabelas cruciais
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE providers;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
