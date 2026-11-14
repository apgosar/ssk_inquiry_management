-- The previous migration gave every existing lead the country code +91. Before country codes
-- existed, numbers were typed as free text, so many contain their own code ("+1 416 555 0123",
-- "0091 98765 43210", "919876543210"). Work out the real code and split it off.
--
-- Only rows that cannot be a valid new-format +91 number (exactly 10 digits) are touched, so
-- anything entered or edited with the new form is left exactly as it is. Rows that cannot be
-- understood with confidence are left unchanged.

CREATE TEMP TABLE _calling_codes (code TEXT PRIMARY KEY);
INSERT INTO _calling_codes (code) VALUES
 ('1'),('7'),
 ('20'),('27'),('30'),('31'),('32'),('33'),('34'),('36'),('39'),('40'),('41'),('43'),('44'),('45'),('46'),('47'),('48'),('49'),
 ('51'),('52'),('53'),('54'),('55'),('56'),('57'),('58'),('60'),('61'),('62'),('63'),('64'),('65'),('66'),
 ('81'),('82'),('84'),('86'),('90'),('91'),('92'),('93'),('94'),('95'),('98'),
 ('211'),('212'),('213'),('216'),('218'),('220'),('221'),('222'),('223'),('224'),('225'),('226'),('227'),('228'),('229'),
 ('230'),('231'),('232'),('233'),('234'),('235'),('236'),('237'),('238'),('239'),('240'),('241'),('242'),('243'),('244'),
 ('245'),('246'),('247'),('248'),('249'),('250'),('251'),('252'),('253'),('254'),('255'),('256'),('257'),('258'),('260'),
 ('261'),('262'),('263'),('264'),('265'),('266'),('267'),('268'),('269'),('290'),('291'),('297'),('298'),('299'),
 ('350'),('351'),('352'),('353'),('354'),('355'),('356'),('357'),('358'),('359'),('370'),('371'),('372'),('373'),('374'),
 ('375'),('376'),('377'),('378'),('379'),('380'),('381'),('382'),('383'),('385'),('386'),('387'),('389'),
 ('420'),('421'),('423'),('500'),('501'),('502'),('503'),('504'),('505'),('506'),('507'),('508'),('509'),
 ('590'),('591'),('592'),('593'),('594'),('595'),('596'),('597'),('598'),('599'),
 ('670'),('672'),('673'),('674'),('675'),('676'),('677'),('678'),('679'),('680'),('681'),('682'),('683'),('685'),('686'),
 ('687'),('688'),('689'),('690'),('691'),('692'),
 ('850'),('852'),('853'),('855'),('856'),('880'),('886'),
 ('960'),('961'),('962'),('963'),('964'),('965'),('966'),('967'),('968'),('970'),('971'),('972'),('973'),('974'),('975'),
 ('976'),('977'),('992'),('993'),('994'),('995'),('996'),('998');

WITH candidates AS (
  SELECT
    l."id",
    ("contactNumber" ~ '^\s*(\+|00)') AS intl,
    CASE
      WHEN "contactNumber" ~ '^\s*00' THEN substr(regexp_replace("contactNumber", '\D', '', 'g'), 3)
      ELSE regexp_replace("contactNumber", '\D', '', 'g')
    END AS d
  FROM "Lead" l
  WHERE l."countryCode" = '+91'
    AND l."contactNumber" !~ '^[0-9]{10}$'
), matched AS (
  SELECT c."id", c.intl, c.d, cc.code
  FROM candidates c
  LEFT JOIN LATERAL (
    SELECT code FROM _calling_codes WHERE c.d LIKE code || '%' ORDER BY length(code) DESC LIMIT 1
  ) cc ON true
), resolved AS (
  SELECT m."id",
    CASE
      -- "+1 4165550123", "0091 9876543210": the code is spelled out
      WHEN m.intl AND m.code IS NOT NULL AND length(m.d) - length(m.code) BETWEEN 5 AND 14
        THEN '+' || m.code
      -- "919876543210" (no plus) -> India
      WHEN NOT m.intl AND length(m.d) = 12 AND m.d LIKE '91%' THEN '+91'
      -- "09876543210" -> India, trunk zero dropped
      WHEN NOT m.intl AND length(m.d) = 11 AND m.d LIKE '0%' THEN '+91'
      -- "98765-43210" -> India, punctuation removed
      WHEN NOT m.intl AND length(m.d) = 10 THEN '+91'
      -- "14165550123": a recognisable code followed by a plausible number
      WHEN NOT m.intl AND m.code IS NOT NULL AND length(m.d) > 10
           AND length(m.d) - length(m.code) BETWEEN 7 AND 12 THEN '+' || m.code
    END AS new_code,
    CASE
      WHEN m.intl AND m.code IS NOT NULL AND length(m.d) - length(m.code) BETWEEN 5 AND 14
        THEN substr(m.d, length(m.code) + 1)
      WHEN NOT m.intl AND length(m.d) = 12 AND m.d LIKE '91%' THEN substr(m.d, 3)
      WHEN NOT m.intl AND length(m.d) = 11 AND m.d LIKE '0%' THEN substr(m.d, 2)
      WHEN NOT m.intl AND length(m.d) = 10 THEN m.d
      WHEN NOT m.intl AND m.code IS NOT NULL AND length(m.d) > 10
           AND length(m.d) - length(m.code) BETWEEN 7 AND 12 THEN substr(m.d, length(m.code) + 1)
    END AS new_number
  FROM matched m
)
UPDATE "Lead" l
SET "countryCode" = r.new_code, "contactNumber" = r.new_number
FROM resolved r
WHERE l."id" = r."id" AND r.new_code IS NOT NULL AND r.new_number IS NOT NULL;

DROP TABLE _calling_codes;

-- "+91 09870319031": drop the leading trunk zero left after splitting off the code, so the
-- number is the 10 digits the form expects. (A valid new-format +91 number never has 11 digits.)
UPDATE "Lead" SET "contactNumber" = substr("contactNumber", 2)
WHERE "countryCode" = '+91' AND "contactNumber" ~ '^0[0-9]{10}$';
