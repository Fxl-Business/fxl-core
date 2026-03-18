-- Safety net: ensure all SDK docs are product-scoped
UPDATE public.documents
SET scope = 'product'
WHERE slug LIKE 'sdk/%' AND scope != 'product';
