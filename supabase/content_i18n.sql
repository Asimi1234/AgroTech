-- Dynamic-content localization (Phase 2): per-row translations for free-text
-- fields the frontend can't enumerate (product name/description, advisory
-- title/detail, group name). Code-keyed content (crop/category/commodity/unit/
-- role names) already localizes via the frontend catalog and needs nothing here.
--
-- Shape: translations jsonb = {"ha":{...},"yo":{...},"ig":{...}}. SupabaseApi
-- attaches it to each row as `i18n`; catalog helpers resolve it at render time
-- with an English fallback. Rows without a translation stay English.
--
-- NOTE: ha/yo/ig values are best-effort and reuse the app's existing catalog
-- vocabulary; they need native-speaker review before production.
-- Idempotent; safe to re-run. Run AFTER align_schema.sql.
--
-- Rows are matched by their (non-unique) seed name/title. If two seed rows ever
-- share a name they'd receive the same translation, which is acceptable — same
-- display text, same localization. New/user-generated rows get no translation
-- and fall back to English.

begin;

alter table public.products   add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.advisories add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.groups     add column if not exists translations jsonb not null default '{}'::jsonb;

-- PRODUCTS (matched by seed name) ------------------------------------------------
update public.products set translations = $j$
{"ha":{"name":"Iri Masara Mai Inganci","description":"Iri masara mai yawan amfani don yankin Kaduna"},
 "yo":{"name":"Irúgbìn Àgbàdo Olóye","description":"Irúgbìn àgbàdo tí ń so ọ̀pọ̀ fún agbègbè Kadúnà"},
 "ig":{"name":"Mkpụrụ Ọka Mara Mma","description":"Mkpụrụ ọka na-amị nke ọma maka mpaghara Kaduna"}}
$j$::jsonb where name = 'Premium Maize Seeds';

update public.products set translations = $j$
{"ha":{"name":"Masu Sayen Rogo","description":"Mai sayen rogo kai tsaye - farashi mafi kyau tabbatacce"},
 "yo":{"name":"Àwọn Olùrà Gbaguda","description":"Olùrà gbaguda tààrà - iye tó dára jù ní ìdánilójú"},
 "ig":{"name":"Ndị Na-azụ Akpụ","description":"Onye na-azụ akpụ ozugbo - ọnụ ahịa kachasị mma ekwenyere"}}
$j$::jsonb where name = 'Cassava Buyers';

update public.products set translations = $j$
{"ha":{"name":"Takin NPK 15-15-15","description":"Ingantaccen takin NPK don noman masara"},
 "yo":{"name":"Ajílẹ̀ NPK 15-15-15","description":"Ajílẹ̀ NPK olóye fún ìmújáde àgbàdo"},
 "ig":{"name":"Fatalaịza NPK 15-15-15","description":"Fatalaịza NPK mara mma maka mmepụta ọka"}}
$j$::jsonb where name = 'NPK 15-15-15 Fertilizer';

-- ADVISORIES (matched by seed title) --------------------------------------------
update public.advisories set translations = $j$
{"ha":{"title":"Lokacin Girbi","detail":"Masara ta shirya girbi kwana 90-100 bayan shuka lokacin da ƙwaya suka bushe kuma suka taurare."},
 "yo":{"title":"Àkókò Ìkórè","detail":"Àgbàdo ti ṣetán fún ìkórè ní ọjọ́ 90-100 lẹ́yìn gbígbìn nígbà tí àwọn hóró bá gbẹ tí ó sì le."},
 "ig":{"title":"Oge Owuwe Ihe Ubi","detail":"Ọka dị njikere maka owuwe ihe ubi ụbọchị 90-100 mgbe akụchara mgbe mkpụrụ ya kpọrọ nkụ ma sie ike."}}
$j$::jsonb where title = 'Harvest Timing';

update public.advisories set translations = $j$
{"ha":{"title":"Kula da Kwari","detail":"Yi hankali da ƙwayar cutar launin ruwan ƙasa na rogo. Cire shukar da ta kamu nan take."},
 "yo":{"title":"Ìṣàkóso Kòkòrò","detail":"Ṣọ́ fáírọ́ọ̀sì ìlà brown gbaguda. Yọ àwọn ohun-ọ̀gbìn tí ó ní àrùn kúrò lẹ́sẹ̀kẹsẹ̀."},
 "ig":{"title":"Njikwa Pest","detail":"Lezie anya maka nje virus akpụ brown streak. Wepụ osisi butere ọrịa ozugbo."}}
$j$::jsonb where title = 'Pest Management';

update public.advisories set translations = $j$
{"ha":{"title":"Sa Taki","detail":"Sa NPK 15-15-15 wata 2-3 bayan shuka don sakamako mafi kyau."},
 "yo":{"title":"Fífi Ajílẹ̀ Sí","detail":"Fi NPK 15-15-15 sí ní oṣù 2-3 lẹ́yìn gbígbìn fún àbájáde tó dára jù."},
 "ig":{"title":"Itinye Fatalaịza","detail":"Tinye NPK 15-15-15 n'ọnwa 2-3 mgbe akụchara maka nsonaazụ kachasị mma."}}
$j$::jsonb where title = 'Fertilizer Application';

update public.advisories set translations = $j$
{"ha":{"title":"Jagorar Ban Ruwa","detail":"Ba masara ruwa kowace kwana 3-4 a lokacin rani, musamman lokacin fure."},
 "yo":{"title":"Ìtọ́sọ́nà Bíbomi","detail":"Bomi àgbàdo ní gbogbo ọjọ́ 3-4 ní àkókò ẹ̀ẹ̀rùn, pàápàá nígbà ìtànná."},
 "ig":{"title":"Ntuziaka Mmiri","detail":"Gbaa ọka mmiri kwa ụbọchị 3-4 n'oge okpọmọkụ, karịsịa n'oge ifuru."}}
$j$::jsonb where title = 'Watering Guide';

-- GROUPS (matched by seed name) -------------------------------------------------
update public.groups set translations = $j$
{"ha":{"name":"Manoman Masara na Kaduna"},
 "yo":{"name":"Àwọn Àgbẹ̀ Àgbàdo Kadúnà"},
 "ig":{"name":"Ndị Ọrụ Ugbo Ọka Kaduna"}}
$j$::jsonb where name = 'Kaduna Maize Farmers';

update public.groups set translations = $j$
{"ha":{"name":"Ƙungiyar Rogo ta Oyo"},
 "yo":{"name":"Ẹgbẹ́ Gbaguda Ọ̀yọ́"},
 "ig":{"name":"Òtù Akpụ Oyo"}}
$j$::jsonb where name = 'Oyo Cassava Cooperative';

update public.groups set translations = $j$
{"ha":{"name":"Manoman Man Kwakwa na Cross River"},
 "yo":{"name":"Àwọn Àgbẹ̀ Epo Ọ̀pẹ Odò-Cross"},
 "ig":{"name":"Ndị Ọrụ Ugbo Mmanụ Nkwụ Cross River"}}
$j$::jsonb where name = 'Cross River Palm Oil Growers';

commit;
