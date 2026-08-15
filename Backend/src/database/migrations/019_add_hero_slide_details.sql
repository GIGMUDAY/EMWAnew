ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS title varchar(255),
  ADD COLUMN IF NOT EXISTS title_am varchar(255),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS description_am text,
  ADD COLUMN IF NOT EXISTS signoff text,
  ADD COLUMN IF NOT EXISTS signoff_am text;

-- Update existing seeded slides or insert Fitsum Alemayehu slide
INSERT INTO hero_slides (
  image_url,
  title,
  title_am,
  description,
  description_am,
  text,
  text_am,
  signoff,
  signoff_am,
  author,
  role,
  role_am,
  display_order,
  is_active
) VALUES (
  '/Fitsum%20Alemayehu.png',
  'A legacy of service.',
  'የአገልግሎት ውርስ።',
  'Fitsum Alemayehu, the first president of EMWA, served the association with diligence and competence for which it is forever grateful.',
  'የEMWA የመጀመሪያዋ ፕሬዝዳንት ፍጹም ዓለማየሁ ማህበሩን በትጋትና በብቃት ያገለገሉ ሲሆን ማህበሩ ዘወትር ምስጋናውን ያቀርባል።',
  'I have many happy memories in Ethiopia and sad to leave. But, I am saddened most because I will miss being part of EMWA.',
  'በኢትዮጵያ ውስጥ ብዙ አስደሳች ትዝታዎች አሉኝ፤ በመለየቴም አዝናለሁ። ይሁን እንጂ ከሁሉ በላይ የሚያሳዝነኝ የEMWA አካል መሆኔ ስለሚቀር ነው።',
  'EMWA extends its gratitude to Wzo. Fitsum and wishes her success and all the best.',
  'EMWA ለወ/ሮ ፍጹም ያለውን ልባዊ ምስጋና እያቀረበ ስኬትና መልካሙን ሁሉ ይመኛል።',
  'Fitsum Alemayehu',
  'First President of EMWA',
  'የEMWA የመጀመሪያዋ ፕሬዝዳንት',
  0,
  true
) ON CONFLICT DO NOTHING;
