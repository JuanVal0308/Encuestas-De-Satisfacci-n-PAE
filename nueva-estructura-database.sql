-- ============================================
-- NUEVA ESTRUCTURA DE BASE DE DATOS PAE
-- ============================================

-- 0) Utilidad para UUID aleatorio
create extension if not exists pgcrypto;

-- 1) ENCUESTAS (cabecera)
create table if not exists public.surveys (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,             -- ej: "satisfaccion-pae-sep-2025"
  title       text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2) PREGUNTAS
-- tipo: 'single' (opción única), 'multi' (multiopción), 'open' (texto), 'rating' (1..5)
create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  survey_id  uuid not null references public.surveys(id) on delete cascade,
  text       text not null,
  type       text not null check (type in ('single','multi','open','rating')),
  ord        int  not null default 1
);

-- 3) OPCIONES (solo para single/multi)
create table if not exists public.choices (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  text        text not null,
  ord         int  not null default 1
);

-- 4) SESIÓN DE RESPUESTA (cada envío completo crea una sesión)
-- client_token: UUID generado en el navegador (crypto.randomUUID())
create table if not exists public.answer_sessions (
  id           uuid primary key default gen_random_uuid(),
  survey_id    uuid not null references public.surveys(id) on delete cascade,
  client_token uuid not null,
  meta         jsonb,                                -- opcional: userAgent, etc.
  created_at   timestamptz not null default now(),
  unique (id, client_token)
);

-- 5) RESPUESTAS (una fila por pregunta)
-- Para 'single'/'multi' se usa choice_id; para 'open' valor_text; para 'rating' valor_num (1..5)
create table if not exists public.answers (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.answer_sessions(id) on delete cascade,
  question_id  uuid not null references public.questions(id) on delete cascade,
  choice_id    uuid references public.choices(id) on delete set null,
  value_text   text,
  value_num    numeric(3,1),
  client_token uuid not null,          -- debe coincidir con el de la sesión
  constraint chk_any_value check (
    choice_id is not null or value_text is not null or value_num is not null
  )
);

-- ===== ÍNDICES ÚTILES =====
create index if not exists idx_questions_survey   on public.questions(survey_id);
create index if not exists idx_choices_question   on public.choices(question_id);
create index if not exists idx_sessions_survey    on public.answer_sessions(survey_id);
create index if not exists idx_answers_session    on public.answers(session_id);
create index if not exists idx_answers_question   on public.answers(question_id);

-- ===== RLS ON =====
alter table public.surveys           enable row level security;
alter table public.questions         enable row level security;
alter table public.choices           enable row level security;
alter table public.answer_sessions   enable row level security;
alter table public.answers           enable row level security;

-- Limpia políticas si existían
drop policy if exists "surveys_select_active"     on public.surveys;
drop policy if exists "questions_select_active"   on public.questions;
drop policy if exists "choices_select_active"     on public.choices;
drop policy if exists "session_insert_active"     on public.answer_sessions;
drop policy if exists "answers_insert_guard"      on public.answers;

-- 1) Leer encuestas activas (público)
create policy "surveys_select_active"
on public.surveys
for select
to anon, authenticated
using (is_active = true);

-- 2) Leer preguntas solo si su encuesta está activa (público)
create policy "questions_select_active"
on public.questions
for select
to anon, authenticated
using (exists (
  select 1 from public.surveys s
  where s.id = survey_id and s.is_active = true
));

-- 3) Leer opciones solo si su encuesta está activa (público)
create policy "choices_select_active"
on public.choices
for select
to anon, authenticated
using (exists (
  select 1
  from public.questions q
  join public.surveys  s on s.id = q.survey_id
  where q.id = question_id and s.is_active = true
));

-- 4) Insertar sesión si la encuesta está activa (público, sin login)
create policy "session_insert_active"
on public.answer_sessions
for insert
to anon, authenticated
with check (exists (
  select 1 from public.surveys s
  where s.id = survey_id and s.is_active = true
));

-- 5) Insertar respuestas vinculadas a la sesión + token y a la misma encuesta (público)
create policy "answers_insert_guard"
on public.answers
for insert
to anon, authenticated
with check (exists (
  select 1
  from public.answer_sessions ss
  join public.surveys s on s.id = ss.survey_id
  where ss.id = session_id
    and ss.client_token = answers.client_token
    and s.is_active = true
    and exists (               -- verifica que la pregunta pertenece a la misma encuesta
      select 1 from public.questions q
      where q.id = answers.question_id
        and q.survey_id = ss.survey_id
    )
));

-- ===== DATOS DEMO =====

-- Encuesta demo
insert into public.surveys (slug, title, description, is_active)
values ('satisfaccion-pae-demo', 'Encuesta de Satisfacción PAE', 'Demo para pruebas', true)
returning id;

-- Usa el id devuelto (o subconsulta) para crear preguntas/opciones
with s as (select id from public.surveys where slug = 'satisfaccion-pae-demo')
insert into public.questions (survey_id, text, type, ord)
select id, 'Califica la calidad del servicio', 'rating', 1 from s
union all
select id, '¿Qué te gustó más?', 'single', 2 from s
union all
select id, 'Comentario adicional', 'open', 3 from s;

with q as (
  select id from public.questions q
  where q.text = '¿Qué te gustó más?'
)
insert into public.choices (question_id, text, ord)
select id, 'Comida', 1 from q
union all select id, 'Atención', 2 from q
union all select id, 'Logística', 3 from q
union all select id, 'Otro', 4 from q;
