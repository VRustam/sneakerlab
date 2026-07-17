-- Full-text search support for products catalog.
-- Adds a generated tsvector column with a GIN index for fast prefix and
-- relevance-ranked search across product name, description, and category.

alter table public.products
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;

create index products_search_idx on public.products using gin (search_vector);

-- Also add a trigram index for partial / fuzzy matching on product name.
create extension if not exists pg_trgm;
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
