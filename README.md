# აგრო თრეიდი × ASILUMI — ვებ-შეთავაზება (v2)

კომერციული შეთავაზება, რომელიც თავად არის მომუშავე პროტოტიპი: აგრო თრეიდის 217 რეალური პროდუქტი, ახალი ვიტრინა 3 სამუშაო ბრენდით + აგრო თრეიდის ვიტრინა, „ერთი ძრავი — ორი მაღაზია“ დემო და ცოცხალი AI კონსულტანტი ვალიკო.

## გაშვება

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## ვალიკო AI — გარემოს ცვლადები

ვალიკო `/api/valiko`-ზე მუშაობს. გასაღების გარეშეც მუშაობს (ჩაშენებული offline მრჩეველი), მაგრამ ნამდვილი AI-სთვის Vercel-ში (ან `.env.local`-ში) დაამატეთ **ერთ-ერთი**:

| ცვლადი | აღწერა |
|---|---|
| `ANTHROPIC_API_KEY` | Claude. მოდელი: `VALIKO_MODEL` (ნაგულისხმევი `claude-sonnet-5`) |
| `OPENAI_API_KEY` | OpenAI-თავსებადი API. მოდელი: `OPENAI_MODEL`, მისამართი: `OPENAI_BASE_URL` |
| `NEXT_PUBLIC_SITE_URL` | საჯარო მისამართი (ბმულის preview სურათისთვის), მაგ. `https://agro.asylum.agency` |

პასუხის header `x-valiko: ai` ნიშნავს ნამდვილ AI-ს, `offline` — ჩაშენებულ მრჩეველს (გასაღები არ არის ან პროვაიდერმა შეცდომა დააბრუნა). ერთ IP-ზე ლიმიტი: 40 მოთხოვნა / 10 წთ.

## კატალოგის განახლება

წყარო: `data/agro-trade-catalog.zip` (agro-trade.ge-ის საჯარო WooCommerce Store API, 24.09.2026 — 217 პროდუქტი + ფოტოები).

```bash
unzip data/agro-trade-catalog.zip -d /tmp/cat
python3 scripts/build-catalog.py /tmp/cat/catalog.json src/data   # → src/data/catalog.json, src/data/xray.json
node scripts/build-images.mjs /tmp/cat/images                       # → public/catalog/{s,m}/*.webp
```

## სტრუქტურა

- `src/app/page.tsx` — სექციები და ტექსტები (ინვესტიცია, საკუთრება, მოთხოვნები)
- `src/components/` — HeroField (WebGL ველი), CatalogAssembly, Storefront, EngineDemo, Valiko, Roadmap
- `src/lib/brands.ts` — GUTANI / KVALI / MITSA / AGRO TRADE თემები
- `src/lib/valiko/` — ვალიკოს სისტემური ინსტრუქცია, კატალოგის ცოდნა და offline მრჩეველი
- `docs/Agro_Trade_Commercial_Proposal_v3.pdf` — PDF ვერსია საკუთრების ბლოკით (წყარო: `docs/pdf-source/`)
- `archive/v1-2026-09-24/` — წინა ვებ-ვერსია, უცვლელად

ფონტები თვითჰოსტინგზეა (`public/fonts`, SIL OFL 1.1). გვერდი `noindex`-ია.
