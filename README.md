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
| `ANTHROPIC_BASE_URL` | არასავალდებულო — Anthropic API-ს ალტერნატიული მისამართი (პროქსი/ტესტი) |
| `NEXT_PUBLIC_SITE_URL` | საჯარო მისამართი (ბმულის preview სურათისთვის), მაგ. `https://agro.asylum.agency` |

პასუხის header `x-valiko: ai` ნიშნავს ნამდვილ AI-ს, `offline` — ჩაშენებულ მრჩეველს; მიზეზი ჩანს `x-valiko-reason`-ში (`no-key`, `http-401`, `timeout`, `network`…). თუ პროვაიდერი 12 წამში არ პასუხობს, ვალიკო ავტომატურად offline რეჟიმზე გადადის — ჩატი აღარ „იჭედება“. ერთ IP-ზე ლიმიტი: 40 მოთხოვნა / 10 წთ.

### დიაგნოსტიკა

გახსენით `/api/valiko?diag=1` (ლოკალურად `http://localhost:3000/api/valiko?diag=1`). ჩანს: ხედავს თუ არა სერვერი გასაღებს (მხოლოდ სიგრძე და პრეფიქსი), Node-ის ვერსია, DNS და TCP კავშირი `api.anthropic.com`-თან IPv4/IPv6-ზე, მოკლე სატესტო მოთხოვნა (`api`) და ნამდვილი ჩატის გზა — სრული კატალოგით და სტრიმინგით (`chat`: `headersMs`, `firstTextMs`, `sample`). გასაღები არასდროს ჩანს სრულად.

- `provider: none` → პროცესი ცვლადს ვერ ხედავს (ფაილი `.env.local` პროექტის ძირშია? სერვერი გადაიტვირთა? pm2/systemd-ის შემთხვევაში env იქ უნდა იყოს).
- `api.status: 401` → გასაღები არასწორია; `400` + credit → ბალანსი; `404` → მოდელის სახელი (`VALIKO_MODEL`).
- `tcp.ipv4.ok: false` → სერვერიდან გამავალი კავშირი დაბლოკილია (firewall / ჰოსტინგი).
- nginx-ის უკან სტრიმინგისთვის პასუხს აქვს `X-Accel-Buffering: no`.

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
