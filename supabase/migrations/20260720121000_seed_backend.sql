insert into public.manufacturers (slug, name, country_code, website_url, status)
values ('cobi', 'COBI', 'PL', 'https://cobi.pl/', 'published')
on conflict (slug) do nothing;

insert into public.sources (name, kind, base_url, notes)
values ('COBI Herstellerseite', 'manufacturer', 'https://cobi.pl/', 'Offizielle Herstellerquelle; EOL nur bei eindeutiger Herstellerangabe als bestätigt markieren.')
on conflict do nothing;

insert into public.sets (
  manufacturer_id, slug, set_number, name, edition, category, subcategory,
  scale, parts_count, eol_status, eol_precision, eol_confirmed, eol_note,
  status, tags
)
select
  m.id, 'cobi-5769', '5769', 'Fairey Swordfish', 'Executive Edition',
  'Militär', 'Flugzeug', '1:32', null, 'unknown', 'unknown', false,
  'Kein belastbares EOL-Datum hinterlegt. Vor Veröffentlichung einer EOL-Angabe Quelle prüfen.',
  'draft', array['fairey swordfish','fleet air arm','royal navy','unternehmen rheinübung']
from public.manufacturers m
where m.slug = 'cobi'
on conflict (slug) do nothing;
