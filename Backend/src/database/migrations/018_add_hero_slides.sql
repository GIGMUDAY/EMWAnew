CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  text text NOT NULL,
  text_am text NOT NULL,
  author varchar(150) NOT NULL,
  role text NOT NULL,
  role_am text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hero_slides_active_order_idx
  ON hero_slides(is_active, display_order ASC, created_at DESC);

INSERT INTO hero_slides (image_url, text, text_am, author, role, role_am, display_order, is_active)
VALUES
(
  'https://images.unsplash.com/photo-1585637071663-799845ad5212?w=1600&q=80',
  'Women journalists on the frontlines are reshaping how the world sees conflict.',
  'በግንባር ላይ ያሉ ሴት ጋዜጠኞች ዓለም ግጭትን የሚያይበትን መንገድ እየቀየሩ ይገኛሉ።',
  'Reuters Institute',
  'Global Press Freedom Report 2026',
  'ዓለም አቀፍ የፕሬስ ነፃነት ሪፖርት 2026',
  1,
  true
),
(
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=80',
  'A record number of women now lead major international newsrooms.',
  'በታሪክ ከፍተኛ ቁጥር ያላቸው ሴቶች አሁን ዋና ዋና ዓለም አቀፍ የዜና ክፍሎችን ይመራሉ።',
  'UNESCO',
  'Women in News, Global Report',
  'ሴቶች በዜና፣ ዓለም አቀፍ ሪፖርት',
  2,
  true
),
(
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80',
  'From Addis to Nairobi, women reporters are driving accountability journalism.',
  'ከአዲስ አበባ እስከ ናይሮቢ፣ ሴት ሪፖርተሮች ተጠያቂነትን የሚያረጋግጥ ጋዜጠኝነትን እየመሩ ነው።',
  'International Women''s Media Foundation',
  '2026 Courage in Journalism Awards',
  'የ2026 በጋዜጠኝነት የጽናትና የድፍረት ሽልማት',
  3,
  true
)
ON CONFLICT DO NOTHING;
