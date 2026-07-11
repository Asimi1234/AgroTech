import i18n from '@/i18n';

/**
 * Localized overrides for dynamic catalog data (products, suppliers, advisories,
 * cooperatives, commodity/crop/region/category/unit labels, roles, reviews,
 * messages). English lives in `data/mockData.ts` and is the source of truth;
 * these dictionaries only carry the non-English variants, resolved at render time
 * against the active language with an English fallback.
 *
 * In Phase 2 the backend serves already-localized content and this layer drops
 * away. HA/YO/IG values are best-effort and need native-speaker review.
 */

type Lang = 'ha' | 'yo' | 'ig';

interface ProductText {
  name: string;
  description: string;
}
interface AdvisoryText {
  title: string;
  window: string;
  detail: string;
}
interface CoopText {
  name: string;
  description: string;
}

interface CatalogText {
  crops: Record<string, string>;
  categories: Record<string, string>;
  regions: Record<string, string>;
  commodities: Record<string, string>;
  units: Record<string, string>;
  suppliers: Record<string, string>;
  memberRoles: Record<string, string>;
  products: Record<string, ProductText>;
  advisories: Record<string, AdvisoryText>;
  cooperatives: Record<string, CoopText>;
  reviews: Record<string, string>;
  messages: Record<string, string>;
  /** Template with {desc}, {region}, {crop} placeholders. */
  longDesc: string;
}

const ha: CatalogText = {
  crops: { cassava: 'Rogo', maize: 'Masara', 'oil-palm': 'Kwakwa', rice: 'Shinkafa' },
  categories: {
    seed: 'Iri',
    fertilizer: 'Taki',
    equipment: 'Kayan aiki',
    'crop-protection': 'Kariyar shuka',
    produce: 'Amfanin gona',
  },
  regions: {},
  commodities: {
    cassava: 'Rogo (sabo)',
    maize: 'Masara (busasshe)',
    'oil-palm': 'Manja (danye)',
    rice: 'Shinkafar fadama',
  },
  units: {
    'per kg': 'kowane kg',
    'per litre': 'kowace lita',
    bundle: 'damara',
    '2kg pack': 'fakitin 2kg',
    seedling: 'tsiro',
    '5kg bag': 'buhun 5kg',
    '50kg bag': 'buhun 50kg',
    '25kg bag': 'buhun 25kg',
    unit: 'guda',
    '1L bottle': 'kwalbar 1L',
    '1kg pack': 'fakitin 1kg',
    '500ml bottle': 'kwalbar 500ml',
    tonne: 'tan',
    '25L keg': 'gawul 25L',
  },
  suppliers: {
    s1: 'GreenField Kayayyakin Noma',
    s2: 'Savannah Iri Ltd',
    s3: 'Benue Kayayyakin Girbi',
    s4: 'Delta Albarkatun Kwakwa',
    s5: "Ma'ajin Noma na Arewa",
    s6: 'Enugu Mafita na Gona',
  },
  memberRoles: {
    Chairperson: 'Shugaba',
    Secretary: 'Sakatare',
    Treasurer: "Ma'aji",
    Member: 'Mamba',
    Coordinator: 'Mai gudanarwa',
  },
  products: {
    p1: { name: 'Ingantattun Sandunan Rogo (TME 419)', description: 'Sandunan rogo masu jure cuta, mai yawan amfani, damara 50.' },
    p2: { name: 'Irin Masara Matashíya (SAMMAZ 15)', description: 'Masara mai jure fari, tana nuna cikin kwana 90.' },
    p3: { name: 'Tsiron Kwakwa Tenera', description: 'Tabbatattun tsiron tenera da suka tsira, mai yawan fitar man.' },
    p4: { name: 'Irin Shinkafa FARO 44', description: 'Irin shinkafa mai dogon hatsi na fadama, mai ƙamshi, mai yawan niƙa.' },
    p5: { name: 'Takin NPK 20-10-10', description: 'Daidaitaccen takin ƙwaya don hatsi, 50kg.' },
    p6: { name: 'Takin Urea (46% N)', description: 'Takin sama mai yawan nitrogen don shinkafar fadama.' },
    p7: { name: 'Bargon Takin Kaji na Halitta', description: 'Mai gyara ƙasa na halitta mai saki a hankali, yana inganta dasashi.' },
    p8: { name: 'Potash na Tokar Kwakwa', description: 'Gyaran mai wadataccen potassium don gonakin kwakwa manya.' },
    p9: { name: 'Naurar Fesawa ta Baya (16L)', description: 'Naurar fesawa ta hannu, bakin tagulla, tanki mai jure UV.' },
    p10: { name: 'Naurar Nika Rogo', description: 'Naurar nika mai amfani da fetur, 500kg/awa don sarrafa gari.' },
    p11: { name: 'Naurar Sussuka Shinkafa', description: 'Naurar sussuka ta ƙafa-da-inji, tana rage asara bayan girbi.' },
    p12: { name: 'Digester na Fruitan Kwakwa mai Inji', description: 'Digester na ƙarfe mai tsafta don niƙar manja ƙarami.' },
    p13: { name: 'Maganin Ciyawa Glyphosate (1L)', description: 'Maganin ciyawa mai shiga jiki don share ƙasa.' },
    p14: { name: 'Maganin Fungi Mancozeb (1kg)', description: 'Maganin fungi na kariya daga cutar ganyen rogo.' },
    p15: { name: 'Maganin Kwari Cypermethrin (1L)', description: 'Maganin kwari mai fadi don masu huda ganga da armyworm.' },
    p16: { name: 'Maganin Kwari na Man Neem (500ml)', description: 'Mai hana kwari na halitta, lafiya ga masu ƙura.' },
    p17: { name: 'Busasshen Falin Rogo (Yawa)', description: 'Falin rogo da rana ta bushe don abinci da sitaci, rukunin tarawa.' },
    p18: { name: 'Hatsin Masara Rawaya (Yawa)', description: 'Tsaftataccen masara rawaya busasshe, danshi ƙasa da 14%.' },
    p19: { name: 'Danyen Manja (25L)', description: 'Sabon niƙaƙƙen jan manja, ƙarancin free-fatty-acid.' },
    p20: { name: 'Niƙaƙƙiyar Shinkafa Dogon Hatsi (Yawa)', description: 'Shinkafar gida marar dutse, gogagge, buhu 50kg, rukunin tarawa.' },
  },
  advisories: {
    a1: { title: 'Yi wa masara takin nitrogen yanzu', window: 'Mako na 4-6 bayan shuka', detail: 'Sa urea a lokacin da ya kai gwiwa kafin ruwan sama mai yawa a tsakiyar mako. Raba sawa yana rage asara.' },
    a2: { title: 'Bincika cutar mosaic na rogo', window: 'Matakin ganye', detail: 'Duba sabbin ganyaye don launin rawaya. Cire kuma ka lalatar da shukar da ta kamu don kare gona.' },
    a3: { title: 'Kula da matakin ruwa 5cm a fadama', window: 'Matakin tsiro', detail: 'Ruwa mai dorewa yana dakile ciyawa da taimakon tsiro. Ana sa ran isasshen ruwan sama a wannan mako a fadama.' },
    a4: { title: 'Cire ciyawa kewaye da sabbin kwakwa kafin takin', window: 'Shekarar kafuwa', detail: 'Share kewaye da mita 1 a kowace kwakwa, sannan sa potash. Yana rage gasa da inganta shan abinci.' },
    a5: { title: 'Matsin fall armyworm na ƙaruwa', window: 'Matakin whorl', detail: 'Tarkunan yankin sun nuna ƙarin ƙwaro. Bincika da sassafe kuma ka yi magani idan barna ta wuce 20% na shuke-shuke.' },
  },
  cooperatives: {
    g1: { name: 'Ƙungiyar Manoman Rogo ta Oyo', description: 'Tana tara sabon rogo da busasshen fali don sayarwa gaba ɗaya ga masu sarrafawa.' },
    g2: { name: 'Masu Tara Masara na Kaduna', description: 'Tara hatsi mai yawa da tarayya wajen bushewa da ajiya.' },
    g3: { name: 'Masu Niƙa Manja na Cross River', description: 'Ƙananan masu niƙa suna tarayyar naurar digester da sayar da danyen manja.' },
    g4: { name: 'Ƙungiyar Manoman Shinkafa ta Benue', description: 'Manoman shinkafa na fadama suna daidaita kayan aiki, niƙa, da samun kasuwa.' },
    g5: { name: 'Matasa Masu Kasuwancin Noma na Enugu', description: 'Matasan manoma suna tara albarkatu don sarrafa rogo da ƙara daraja.' },
    g6: { name: 'Manoman Rani na Kano', description: 'Noman rani na ban ruwa tare da tarayyar famfo da sayen kaya mai yawa.' },
  },
  reviews: {
    r1: 'An kai a kan lokaci daidai yadda aka bayyana. Zan sake yin oda.',
    r2: 'Ingantacce, kodayake marufi zai iya zama mai ƙarfi.',
    r3: 'Mai kaya ya amsa dukan tambayoyi na kafin na biya. Amintacce.',
  },
  messages: {
    gm1: "Mai sarrafawa ya tabbatar da ɗauka ranar Juma'a. Da fatan za a kawo busasshen fali wurin tarawa da ƙarfe 9 na safe.",
    gm2: 'An lura. Zan shirya buhu 12.',
    gm3: 'Za mu iya tattauna rabon kuɗin sabuwar naurar nika a taro na gaba?',
    gm4: 'Farashin hatsi a maajiya ya koma 520/kg. Riƙe kayanka idan za ka iya jira mako guda.',
    gm5: 'Akwai wurin ajiya don ƙarin tan 20.',
    gm6: 'An gama gyaran digester. Takardar yin rijista a buɗe take don mako mai zuwa.',
    gm7: 'An gyara naurar sussuka. Tunatarwa: girbi zai fara cikin makonni uku, ka shirya buhunanka.',
    gm8: 'Horon marufin gari ranar Asabar. Ka tabbatar da zuwa nan.',
    gm9: "Odar taki mai yawa zai rufe ranar Juma'a. Aika adadinka.",
  },
  longDesc:
    '{desc} Ana samu ta hannun amintattun masu kaya na {region} kuma ya dace da ƙananan ayyukan {crop}. Farashi alama ne kuma ana iya cinikinsa kai tsaye da mai kaya. Tuntuɓi mai kaya don tabbatar da kaya, hanyoyin isarwa cikin {region}, da rangwame don odar ƙungiya.',
};

const yo: CatalogText = {
  crops: { cassava: 'Gbaguda', maize: 'Àgbàdo', 'oil-palm': 'Igi Ọ̀pẹ', rice: 'Ìrẹsì' },
  categories: {
    seed: 'Irúgbìn',
    fertilizer: 'Ajílẹ̀',
    equipment: 'Ohun-èlò',
    'crop-protection': 'Ààbò irúgbìn',
    produce: 'Ìkórè',
  },
  regions: {
    oyo: 'Ọ̀yọ́',
    kaduna: 'Kadúnà',
    benue: 'Bénúè',
    'cross-river': 'Odò-Cross',
    kano: 'Kánò',
    enugu: 'Énúgù',
  },
  commodities: {
    cassava: 'Gbaguda (ẹ̀gẹ́ tútù)',
    maize: 'Àgbàdo (ọ̀gbìn gbígbẹ)',
    'oil-palm': 'Epo Pupa (àìdàró)',
    rice: 'Ìrẹsì Pádì',
  },
  units: {
    'per kg': 'fún kg',
    'per litre': 'fún lítà',
    bundle: 'ìdì',
    '2kg pack': 'àpò 2kg',
    seedling: 'àgbìn',
    '5kg bag': 'àpò 5kg',
    '50kg bag': 'àpò 50kg',
    '25kg bag': 'àpò 25kg',
    unit: 'ẹyọ kan',
    '1L bottle': 'ìgò 1L',
    '1kg pack': 'àpò 1kg',
    '500ml bottle': 'ìgò 500ml',
    tonne: 'tọ́ọ̀nù',
    '25L keg': 'kẹ́gì 25L',
  },
  suppliers: {
    s1: 'GreenField Àwọn Ohun-èlò Àgbẹ̀',
    s2: 'Savannah Irúgbìn Ltd',
    s3: 'Benue Àwọn Ọjà Ìkórè',
    s4: 'Delta Àwọn Ohun-àmúṣọrọ̀ Ọ̀pẹ',
    s5: 'Ilé-ìtajà Àgbẹ̀ Àríwá',
    s6: 'Enugu Àwọn Ọ̀nà-àbáyọ Oko',
  },
  memberRoles: {
    Chairperson: 'Alága',
    Secretary: 'Akọ̀wé',
    Treasurer: 'Akápò',
    Member: 'Ọmọ ẹgbẹ́',
    Coordinator: 'Alámòjútó',
  },
  products: {
    p1: { name: 'Àwọn Igi Gbaguda Tí a Ṣàtúnṣe (TME 419)', description: 'Igi gbaguda tí ó lòdì sí àrùn, tí ó ń so ọ̀pọ̀, ìdì 50.' },
    p2: { name: 'Irúgbìn Àgbàdo Àdàpọ̀ (SAMMAZ 15)', description: 'Àgbàdo àdàpọ̀ tí ó fara da ọ̀dá, ó gbó ní ọjọ́ 90.' },
    p3: { name: 'Àwọn Àgbìn Igi Ọ̀pẹ Tenera', description: 'Àwọn àgbìn tenera tí ó ti hù tí a fọwọ́sí, ìwọ̀n ìyọ epo gíga.' },
    p4: { name: 'Irúgbìn Ìrẹsì FARO 44', description: 'Irúgbìn ìrẹsì ọkà gígùn ilẹ̀ pẹ̀tẹ́lẹ̀, olóòórùn dídùn, èso lílọ̀ gíga.' },
    p5: { name: 'Ajílẹ̀ NPK 20-10-10', description: 'Ajílẹ̀ oníhóró tí ó dọ́gba fún àwọn irúgbìn ọkà, 50kg.' },
    p6: { name: 'Ajílẹ̀ Urea (46% N)', description: 'Ajílẹ̀ ìbòrí oní-nitrogen gíga fún ìrẹsì pádì.' },
    p7: { name: 'Àwọn Pẹ́lẹ́tì Ìdọ̀tí Adìyẹ Alámọ̀', description: 'Aṣàtúnṣe ilẹ̀ alámọ̀ tí ń tú jáde lọ́ra, ó ń mú isu gbòǹgbò dára.' },
    p8: { name: 'Potash Eérú Ìdì Ọ̀pẹ', description: 'Àtúnṣe ọlọ́rọ̀ potassium fún àwọn oko ọ̀pẹ tí ó dàgbà.' },
    p9: { name: 'Ẹ̀rọ Ìwúwọ́ Ẹ̀yìn (16L)', description: 'Ẹ̀rọ ìwúwọ́ ẹ̀yìn oníṣe-ọwọ́, ojú-idọ̀tí idẹ, tanki tí ó lòdì sí UV.' },
    p10: { name: 'Ẹ̀rọ Gbígbẹ̀rẹ́ Gbaguda', description: 'Ẹ̀rọ gbígbẹ̀rẹ́ tí epo ń darí, 500kg/wákàtí fún ṣíṣe garri.' },
    p11: { name: 'Ẹ̀rọ Ìpakà Ìrẹsì', description: 'Ẹ̀rọ ìpakà ìrẹsì oní-ẹsẹ̀-àti-mọ́tò, ó dín àdánù lẹ́yìn ìkórè kù.' },
    p12: { name: 'Digester Èso Ọ̀pẹ Oní-ẹ̀rọ', description: 'Digester adàgọ̀ fún lílọ̀ epo ọ̀pẹ ní ìwọ̀n kékeré.' },
    p13: { name: 'Oògùn Èpò Glyphosate (1L)', description: 'Oògùn èpò systemic tí kì í yàn fún ìwẹ̀ ilẹ̀.' },
    p14: { name: 'Oògùn Elú Mancozeb (1kg)', description: 'Oògùn elú aabo lòdì sí àrùn ewé gbaguda.' },
    p15: { name: 'Oògùn Kòkòrò Cypermethrin (1L)', description: 'Oògùn kòkòrò gbòòrò fún àwọn agùn-ẹsẹ̀ àti armyworm.' },
    p16: { name: 'Bio-Oògùn Kòkòrò Epo Neem (500ml)', description: 'Ìdènà kòkòrò alámọ̀, ààbò fún àwọn agbọ̀n-òdòdó.' },
    p17: { name: 'Chips Gbaguda Gbígbẹ (Ọ̀pọ̀)', description: 'Chips gbaguda tí oòrùn gbẹ fún oúnjẹ ẹran àti starch, ìpín akójọ.' },
    p18: { name: 'Ọkà Àgbàdo Ofeefee (Ọ̀pọ̀)', description: 'Àgbàdo ofeefee tí a ti wẹ̀, tí ó gbẹ, ọ̀rinrin lábẹ́ 14%.' },
    p19: { name: 'Epo Pupa Àìdàró (25L)', description: 'Epo pupa tí a ṣẹ̀ṣẹ̀ lọ̀, akoónú free-fatty-acid kékeré.' },
    p20: { name: 'Ìrẹsì Ọkà-Gígùn Tí a Lọ̀ (Ọ̀pọ̀)', description: 'Ìrẹsì ìbílẹ̀ tí a yọ òkúta kúrò, tí a dán, àpò 50kg, ìpín akójọ.' },
  },
  advisories: {
    a1: { title: 'Fi nitrogen bo àgbàdo ní orí báyìí', window: 'Ọ̀sẹ̀ 4-6 lẹ́yìn gbígbìn', detail: 'Fi urea sí ìpele eékún kí òjò ńlá tó rọ̀ ní àárín ọ̀sẹ̀. Pípín ìfisí dín àdánù nípa ríràn kù.' },
    a2: { title: 'Ṣọ́ ààrùn mosaic gbaguda', window: 'Ìpele ìdàgbà ewé', detail: 'Ṣàyẹ̀wò àwọn ewé tuntun fún àmì ofeefee. Fàtu kí o sì pa àwọn ohun-ọ̀gbìn tí ó ní àrùn run láti dáàbò bo oko.' },
    a3: { title: 'Pa ìpele omi 5cm mọ́ nínú pádì', window: 'Ìpele ìsọ̀rọ̀', detail: 'Ìkún omi dídúró máa ń dènà èpò kí ó sì ṣe àtìlẹ́yìn ìsọ̀rọ̀. Retí òjò tó tó ní ọ̀sẹ̀ yìí ní àwọn agbègbè pẹ̀tẹ́lẹ̀.' },
    a4: { title: 'Wẹ àyíká igi ọ̀pẹ tuntun kí o tó fi ajílẹ̀', window: 'Ọdún ìdásílẹ̀', detail: 'Wẹ àyíká 1m yí igi ọ̀pẹ kọ̀ọ̀kan, lẹ́yìn náà fi potash. Ó dín ìdíje kù ó sì mú kí gbígba oúnjẹ dára.' },
    a5: { title: 'Ìdààmú kòkòrò armyworm ń pọ̀ sí i', window: 'Ìpele whorl', detail: 'Àwọn okò ẹ̀wọ̀n agbègbè fi hàn pé iye labalábá pọ̀ sí i. Ṣọ́ ní kùtùkùtù òwúrọ̀ kí o sì tọ́jú bí ìbàjẹ́ bá kọjá 20% àwọn ohun-ọ̀gbìn.' },
  },
  cooperatives: {
    g1: { name: 'Ẹgbẹ́ Àwọn Àgbẹ̀ Gbaguda Ọ̀yọ́', description: 'Ń kó ẹ̀gẹ́ tútù àti chips gbígbẹ jọ fún títà àpapọ̀ sí àwọn aṣàgbékalẹ̀.' },
    g2: { name: 'Àwọn Akójọ Àgbàdo Kadúnà', description: 'Ìkójọ ọkà ní ọ̀pọ̀ àti pípín àyè gbígbẹ àti ìpamọ́.' },
    g3: { name: 'Àwọn Olọ Epo Ọ̀pẹ Odò-Cross', description: 'Àwọn olọ kékeré tí ń pín digester ẹ̀rọ àti títa epo pupa àìdàró.' },
    g4: { name: 'Ẹgbẹ́ Àwọn Àgbẹ̀ Ìrẹsì Bénúè', description: 'Àwọn àgbẹ̀ ìrẹsì ilẹ̀ pẹ̀tẹ́lẹ̀ tí ń ṣàkóso ohun-èlò, lílọ̀, àti àyè ọjà.' },
    g5: { name: 'Àwọn Ọ̀dọ́ Oníṣòwò-Àgbẹ̀ Énúgù', description: 'Àwọn àgbẹ̀ ọ̀dọ́ tí ń kó owó jọ fún ṣíṣe gbaguda àti fífi iye kún un.' },
    g6: { name: 'Àwọn Àgbẹ̀ Àkókò Ẹ̀ẹ̀rùn Kánò', description: 'Ìṣèjáde àkókò ẹ̀ẹ̀rùn pẹ̀lú omi-ọ̀gbìn àti rírà ohun-èlò ní ọ̀pọ̀.' },
  },
  reviews: {
    r1: 'Wọ́n fi jíṣẹ́ ní àkókò gẹ́gẹ́ bí a ti ṣàpèjúwe. Màá tún pè é.',
    r2: 'Dáradára, bí ó tilẹ̀ jẹ́ pé ìdìpọ̀ lè le sí i.',
    r3: 'Olùpèsè dáhùn gbogbo ìbéèrè mi kí n tó san. Ó yẹ ní ìgbọ́kànlé.',
  },
  messages: {
    gm1: 'Aṣàgbékalẹ̀ jẹ́rìí ìgbésẹ̀ fún Ẹtì. Jọ̀wọ́ mú chips gbígbẹ wá sí ibi ìkójọ ní aago 9 òwúrọ̀.',
    gm2: 'Ó yé mi. Màá ní àpò 12 tí ó ti ṣetán.',
    gm3: 'Ṣé a lè jíròrò pípín iye owó ẹ̀rọ gbígbẹ̀rẹ́ tuntun ní ìpàdé tó ń bọ̀?',
    gm4: 'Iye ọkà ní ilé-ìtajà lọ sí 520/kg. Di ọjà rẹ mú bí o bá lè dúró fún ọ̀sẹ̀ kan.',
    gm5: 'Àyè ìpamọ́ wà fún tọ́ọ̀nù 20 mìíràn.',
    gm6: 'Ìtọ́jú digester ti parí. Ìwé ìforúkọsílẹ̀ ṣí sílẹ̀ fún ọ̀sẹ̀ tó ń bọ̀.',
    gm7: 'A ti tún ẹ̀rọ ìpakà ṣe. Ìránnilétí: ìkórè bẹ̀rẹ̀ ní ọ̀sẹ̀ mẹ́ta, palẹ̀mọ́ àwọn àpò rẹ.',
    gm8: 'Ìdálẹ́kọ̀ọ́ ìdìpọ̀ garri ní Àbámẹ́ta yìí. Fèsì síbí.',
    gm9: 'Àṣẹ ajílẹ̀ ní ọ̀pọ̀ tì ní Ẹtì. Fi iye rẹ ránṣẹ́.',
  },
  longDesc:
    '{desc} A ń rí i láti ọ̀dọ̀ àwọn olùpèsè {region} tí a ti ṣàyẹ̀wò, ó sì bá iṣẹ́ {crop} kékeré mu. Iye jẹ́ ìtọ́kasí ó sì lè jẹ́ ìdúnàdúrà tààrà pẹ̀lú olùpèsè. Kàn sí olùpèsè láti jẹ́rìí ọjà tó wà, àwọn ọ̀nà ìfijíṣẹ́ nínú {region}, àti ẹ̀dínwó fún àṣẹ ẹgbẹ́.',
};

const ig: CatalogText = {
  crops: { cassava: 'Akpụ', maize: 'Ọka', 'oil-palm': 'Nkwụ', rice: 'Osikapa' },
  categories: {
    seed: 'Mkpụrụ',
    fertilizer: 'Fatalaịza',
    equipment: 'Akụrụngwa',
    'crop-protection': 'Nchekwa ihe ọkụkụ',
    produce: 'Ihe ubi',
  },
  regions: {},
  commodities: {
    cassava: 'Akpụ (jigbo ọhụrụ)',
    maize: 'Ọka (mkpụrụ kpọrọ nkụ)',
    'oil-palm': 'Mmanụ Nkwụ (obi)',
    rice: 'Osikapa (paddy)',
  },
  units: {
    'per kg': 'kwa kg',
    'per litre': 'kwa lita',
    bundle: 'ùkwù',
    '2kg pack': 'ngwugwu 2kg',
    seedling: 'mkpụrụ',
    '5kg bag': 'akpa 5kg',
    '50kg bag': 'akpa 50kg',
    '25kg bag': 'akpa 25kg',
    unit: 'otu',
    '1L bottle': 'karama 1L',
    '1kg pack': 'ngwugwu 1kg',
    '500ml bottle': 'karama 500ml',
    tonne: 'tọn',
    '25L keg': 'keg 25L',
  },
  suppliers: {
    s1: 'GreenField Ngwaahịa Ọrụ Ugbo',
    s2: 'Savannah Mkpụrụ Ltd',
    s3: 'Benue Ngwaahịa Owuwe Ihe Ubi',
    s4: 'Delta Akụ Nkwụ',
    s5: 'Ụlọ Ahịa Ọrụ Ugbo Ugwu',
    s6: 'Enugu Ngwọta Ugbo',
  },
  memberRoles: {
    Chairperson: 'Onye isi oche',
    Secretary: 'Odeakwụkwọ',
    Treasurer: 'Onye ọchịakụ',
    Member: 'Onye òtù',
    Coordinator: 'Onye nhazi',
  },
  products: {
    p1: { name: 'Sịtem Akpụ Emeziri Emezi (TME 419)', description: 'Osisi akpụ na-eguzogide ọrịa, na-amị nke ọma, ùkwù 50.' },
    p2: { name: 'Mkpụrụ Ọka Agwakọta (SAMMAZ 15)', description: 'Ọka agwakọta na-eguzogide ụkọ mmiri, na-achá n’ụbọchị 90.' },
    p3: { name: 'Mkpụrụ Osisi Nkwụ Tenera', description: 'Mkpụrụ tenera epupụtara akwadoro, oke mmịpụta mmanụ dị elu.' },
    p4: { name: 'Mkpụrụ Osikapa FARO 44', description: 'Mkpụrụ osikapa ogologo mkpụrụ nke ala dị ala, na-esi ísì ụtọ, mkpụrụ ịkwọ dị elu.' },
    p5: { name: 'Fatalaịza NPK 20-10-10', description: 'Fatalaịza nkọ kwụ ọtọ maka mkpụrụ ọka, 50kg.' },
    p6: { name: 'Fatalaịza Urea (46% N)', description: 'Fatalaịza mkpuchi elu nwere nitrogen dị elu maka osikapa paddy.' },
    p7: { name: 'Pellet Nsị Ọkụkọ Eke', description: 'Ihe nrụzi ala eke na-ahapụ nwayọọ, na-eme ka mgịrịga mma.' },
    p8: { name: 'Potash Ntụ Ùkwù Nkwụ', description: 'Nrụzi bara ụba potassium maka ubi nkwụ tozuru okè.' },
    p9: { name: 'Igwe Ịfesa Azụ (16L)', description: 'Igwe ịfesa azụ eji aka arụ, ọnụ ọla, tank na-eguzogide UV.' },
    p10: { name: 'Igwe Ịkwọ Akpụ', description: 'Igwe ịkwọ na-eji petrol arụ ọrụ, 500kg/elekere maka ịhazi garri.' },
    p11: { name: 'Igwe Ịzọcha Osikapa', description: 'Igwe ịzọcha osikapa nke ụkwụ-na-injin, na-ebelata mfu mgbe owuwe gasịrị.' },
    p12: { name: 'Digester Mkpụrụ Nkwụ Injin', description: 'Digester anaghị echu echu maka ịkwọ mmanụ nkwụ obere.' },
    p13: { name: 'Ọgwụ Ahịhịa Glyphosate (1L)', description: 'Ọgwụ ahịhịa na-abanye n’ahụ maka ikpochapụ ala.' },
    p14: { name: 'Ọgwụ Ero Mancozeb (1kg)', description: 'Ọgwụ ero nchebe megide ọrịa akwụkwọ akpụ.' },
    p15: { name: 'Ọgwụ Ụmụ Ahụhụ Cypermethrin (1L)', description: 'Ọgwụ ụmụ ahụhụ sara mbara maka ndị na-egwu osisi na armyworm.' },
    p16: { name: 'Bio-Ọgwụ Ụmụ Ahụhụ Mmanụ Neem (500ml)', description: 'Ihe mgbochi ụmụ ahụhụ eke, dị mma maka ụmụ ahụhụ na-ebunye.' },
    p17: { name: 'Chips Akpụ Kpọrọ Nkụ (Ọtụtụ)', description: 'Chips akpụ anwụ kpọrọ maka nri anụmanụ na starch, otu nchịkọta.' },
    p18: { name: 'Mkpụrụ Ọka Odo (Ọtụtụ)', description: 'Ọka odo asachara, kpọrọ nkụ, mmiri n’okpuru 14%.' },
    p19: { name: 'Mmanụ Nkwụ Obi (25L)', description: 'Mmanụ nkwụ uhie akwọrọ ọhụrụ, obere free-fatty-acid.' },
    p20: { name: 'Osikapa Ogologo Mkpụrụ Akwọrọ (Ọtụtụ)', description: 'Osikapa obodo ewepụrụ okwute, hịchara, akpa 50kg, otu nchịkọta.' },
  },
  advisories: {
    a1: { title: 'Tinye nitrogen n’elu ọka ugbu a', window: 'Izu 4-6 mgbe akụchara', detail: 'Tinye urea mgbe ọ ruru ikpere tupu oke mmiri ozuzo n’etiti izu. Ikewa etinye na-ebelata mfu.' },
    a2: { title: 'Chọọ ọrịa mosaic akpụ', window: 'Ọkwa epupụta akwụkwọ', detail: 'Nyochaa akwụkwọ ọhụrụ maka ntụpọ odo odo. Wepụ ma bibie osisi butere ọrịa iji chebe ubi.' },
    a3: { title: 'Debe ọkwa mmiri 5cm n’ubi', window: 'Ọkwa ịwapụta', detail: 'Idei mmiri kwụsiri ike na-egbochi ata ma na-akwado ịwa. Tụ anya mmiri ozuzo zuru oke n’izu a n’ala dị ala.' },
    a4: { title: 'Wepu ahịhịa gburugburu nkwụ ọhụrụ tupu itinye fatalaịza', window: 'Afọ nguzobe', detail: 'Kpochapụ 1m gburugburu nkwụ ọ bụla, wee tinye potash. Na-ebelata asọmpi ma na-eme ka mmịnye nri dịkwuo mma.' },
    a5: { title: 'Nrụgide fall armyworm na-arị elu', window: 'Ọkwa whorl', detail: 'Ọnyà mpaghara na-egosi mmụba ọnụọgụ moth. Chọọ n’isi ụtụtụ ma gwọọ naanị ma mmebi karịrị 20% nke osisi.' },
  },
  cooperatives: {
    g1: { name: 'Òtù Ndị Ọrụ Ugbo Akpụ Oyo', description: 'Na-achịkọta jigbo ọhụrụ na chips kpọrọ nkụ maka ire ọnụ nye ndị na-ahazi.' },
    g2: { name: 'Ndị Nchịkọta Ọka Kaduna', description: 'Nchịkọta mkpụrụ n’ọtụtụ na ikere òkè n’ebe ịkpọ nkụ na nchekwa.' },
    g3: { name: 'Ndị na-akwọ Mmanụ Nkwụ Cross River', description: 'Ndị obere na-akwọ na-ekere digester eji injin arụ ma na-ere mmanụ nkwụ obi.' },
    g4: { name: 'Òtù Ndị Ọrụ Ugbo Osikapa Benue', description: 'Ndị na-akọ osikapa ala dị ala na-ahazi ihe eji arụ ọrụ, ịkwọ, na ohere ahịa.' },
    g5: { name: 'Ndị Ntorobịa Ọchụnta Ego Ugbo Enugu', description: 'Ndị ọrụ ugbo na-eto eto na-akpakọba akụ maka ihụzu akpụ na mgbakwunye uru.' },
    g6: { name: 'Ndị Ọrụ Ugbo Oge Okpọmọkụ Kano', description: 'Mmepụta oge okpọmọkụ site na mmiri ogbugba na ikere pọmpụ na ịzụ ihe n’ọtụtụ.' },
  },
  reviews: {
    r1: 'E nyefere n’oge kwekọrọ ka akọwara. Aga m enwe ọzọ.',
    r2: 'Ezigbo mma, n’agbanyeghị na nkwakọ nwere ike isiwe ike.',
    r3: 'Onye na-eweta zara ajụjụ m niile tupu m kwụọ ụgwọ. Onye a pụrụ ịtụkwasị obi.',
  },
  messages: {
    gm1: 'Onye nhazi kwadoro mbuli maka Fraịde. Biko weta chips kpọrọ nkụ n’ebe nchịkọta ka ọ na-erule elekere 9 ụtụtụ.',
    gm2: 'Amatala m. Aga m enwe akpa 12 dị njikere.',
    gm3: 'Anyị nwere ike ikwurịta òkè ego igwe ntụ ọhụrụ na nzukọ na-esote?',
    gm4: 'Ọnụ ahịa mkpụrụ n’ụlọ ahịa gbagoro na 520/kg. Jide ngwongwo gị ma ọ bụrụ na ị nwere ike ichere otu izu.',
    gm5: 'Ohere nchekwa dị maka tọn 20 ọzọ.',
    gm6: 'Emechaala nlekọta digester. Mpempe akwụkwọ ndebanye aha ghere oghe maka izu na-abịa.',
    gm7: 'Emezila igwe ịzọcha. Ncheta: owuwe ihe ubi na-amalite n’izu atọ, kwadebe akpa gị.',
    gm8: 'Ọzụzụ nkwakọ garri Satọde a. Zaghachi ebe a.',
    gm9: 'Iji fatalaịza n’ọtụtụ na-emechi Fraịde. Zipu ọnụọgụ gị.',
  },
  longDesc:
    '{desc} A na-enweta ya site n’aka ndị na-eweta {region} a nyochara ma kwekọ na obere ọrụ {crop}. Ọnụ ahịa bụ ntụaka ma enwere ike ịkparịta ya ozugbo na onye na-eweta. Kpọtụrụ onye na-eweta iji kwado ngwongwo dị, ụzọ nnyefe n’ime {region}, na mbelata maka iji òtù.',
};

const catalog: Record<Lang, CatalogText> = { ha, yo, ig };

const activeLang = (): Lang | null => {
  const code = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2);
  return code === 'ha' || code === 'yo' || code === 'ig' ? code : null;
};

const withLang = <T>(pick: (c: CatalogText) => T | undefined): T | undefined => {
  const lang = activeLang();
  return lang ? pick(catalog[lang]) : undefined;
};

// --- Low-level lookups used by the mockData label helpers -------------------

export const catalogCrop = (id: string): string | undefined =>
  withLang((c) => c.crops[id]);

export const catalogRegion = (id: string): string | undefined =>
  withLang((c) => c.regions[id]);

export const catalogCategory = (id: string): string | undefined =>
  withLang((c) => c.categories[id]);

// --- Render helpers (English value passed as fallback) ----------------------

export const commodityLabel = (cropType: string, en: string): string =>
  withLang((c) => c.commodities[cropType]) ?? en;

export const unitLabel = (en: string): string =>
  withLang((c) => c.units[en]) ?? en;

export const memberRole = (en: string): string =>
  withLang((c) => c.memberRoles[en]) ?? en;

export const supplierName = (id: string, en: string): string =>
  withLang((c) => c.suppliers[id]) ?? en;

export const productName = (p: { id: string; name: string }): string =>
  withLang((c) => c.products[p.id]?.name) ?? p.name;

export const productDescription = (p: {
  id: string;
  description: string;
}): string => withLang((c) => c.products[p.id]?.description) ?? p.description;

export const advisoryTitle = (a: { id: string; title: string }): string =>
  withLang((c) => c.advisories[a.id]?.title) ?? a.title;

export const advisoryWindow = (a: { id: string; window: string }): string =>
  withLang((c) => c.advisories[a.id]?.window) ?? a.window;

export const advisoryDetail = (a: { id: string; detail: string }): string =>
  withLang((c) => c.advisories[a.id]?.detail) ?? a.detail;

export const cooperativeName = (g: { id: string; name: string }): string =>
  withLang((c) => c.cooperatives[g.id]?.name) ?? g.name;

export const cooperativeDescription = (g: {
  id: string;
  description: string;
}): string =>
  withLang((c) => c.cooperatives[g.id]?.description) ?? g.description;

export const reviewComment = (r: { id: string; comment: string }): string =>
  withLang((c) => c.reviews[r.id]) ?? r.comment;

export const messageBody = (m: { id: string; body: string }): string =>
  withLang((c) => c.messages[m.id]) ?? m.body;

/** Compose a localized long description from already-localized parts. */
export const longDescription = (
  desc: string,
  region: string,
  crop: string,
): string => {
  const tpl = withLang((c) => c.longDesc);
  if (tpl) {
    return tpl
      .split('{desc}')
      .join(desc)
      .split('{region}')
      .join(region)
      .split('{crop}')
      .join(crop);
  }
  return `${desc} Sourced through vetted ${region} suppliers and suited to small-scale ${crop} operations. Prices are indicative and may be negotiated directly with the supplier. Contact the supplier to confirm current stock, delivery options within ${region}, and bulk discounts for cooperative orders.`;
};
