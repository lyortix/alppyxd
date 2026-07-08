# Lo-Fi Square

Anonim, chill bir mahallede yürüyüp evlere giren, yabancılarla kafa-üstü metin
sohbeti yapan bir sosyal MVP. İsim + yaş dışında hiçbir kişisel veri
saklanmaz; kimlik yalnızca tarayıcıda üretilen anonim bir cihaz kimliği
(`crypto.randomUUID()`, `localStorage`) üzerinden temsil edilir.

## Mimari

İki ayrı servis olarak çalışır (bkz. proje brief'i — Vercel kalıcı websocket'i
iyi taşımadığı için realtime backend ayrı bir yere deploy edilir):

- **`web/`** — Next.js (App Router) + TypeScript + Phaser 3. React sadece UI
  kabuğu (giriş ekranı, HUD); mahalle/ev/karakter/sohbet balonları tek bir
  `<canvas>` içinde Phaser ile render edilir. Vercel'e deploy edilir.
- **`server/`** — Colyseus realtime sunucusu. Her "ev" bir Colyseus oda tipi
  (`house_<id>`); aynı evin birden fazla eşzamanlı örneği (instance) olabilir
  — bu hem oda kapasitesini hem de no-rematch mekanizmasını çözer (aşağıya
  bakın). Railway/Render gibi kalıcı bir Node ortamına deploy edilir.

Bu iki servis ayrı repo/paket olarak geliştirildiği için (monorepo/shared
package yok), `HOUSES` konfigürasyonu (id, konum) hem
`server/src/houses.ts` hem de `web/game/config.ts` içinde küçük bir kopya
olarak tutulur — yeni bir ev eklerken ikisini de güncelleyin. Doluluk sayıları
ve reveal eşikleri ise runtime'da sunucudan (`/occupancy`) canlı çekilir.

## Kimlik & gizlilik modeli

- Girişte istenen **isim + yaş** hiçbir zaman kalıcı diske yazılmaz. Yaş,
  yalnızca istemci tarafında "18+ kapısı" için anlık kullanılır ve hiçbir
  yere gönderilmez. İsim, yalnızca aktif olduğun oda (house) state'inde
  RAM'de yaşar; odadan ayrılınca silinir.
- Report / no-rematch, kimliğinizle bağlantısız rastgele bir **anonim cihaz
  kimliği** (`localStorage`, `crypto.randomUUID()`) üzerinden çalışır.
  Sunucu bunu yalnızca RAM'de tutar (`server/src/moderation/store.ts`),
  hiçbir kalıcı veritabanı yoktur.

## Güvenlik katmanı

- **18+ yaş kapısı** — `web/components/LoginScreen.tsx`: yaş < 18 iken "Gir"
  butonu pasif olur (sadece uyarı değil).
- **Küfür/kelime filtresi** — `server/src/moderation/profanityFilter.ts`:
  mesaj, ekranda belirmeden önce sunucu tarafında normalize edilip (leetspeak,
  Türkçe karakter, boşluk/noktalama hilelerine karşı) kara listeyle
  karşılaştırılır; eşleşirse tüm mesajın yerine `[mesaj filtrelendi]` yayınlanır.
- **Report + no-rematch** — `server/src/rooms/HouseRoom.ts`: report, iki
  cihaz kimliğini karşılıklı olarak engellenmiş işaretler
  (`moderation/store.ts`). Bir oda örneğine katılım denemesi sırasında
  (`onAuth`) engellenmiş biriyle karşılaşılırsa katılım reddedilir; istemci
  otomatik olarak o evin **taze bir örneğini** (`client.create(...)`) açar —
  böylece iki taraf bir daha aynı odaya düşmez.

## Doluluk / soğuk-başlangıç mantığı

- Her ev, kapasitesine (`HouseConfig.capacity`, varsayılan 6) ulaşınca veya bir
  engel çakışması olunca otomatik olarak yeni bir Colyseus oda örneği açar.
- `GET /occupancy` tüm ev tiplerinin tüm örnekleri üzerinden toplam canlı
  kişi sayısını döner; mahalle sahnesi bunu ~3 saniyede bir çeker.
- Boş evler soluklaşır, dolu evler parlar (`NeighborhoodScene.refreshHouseVisuals`).
- Yeni evler, toplam eşzamanlı oyuncu sayısı belli bir eşiği geçmeden
  haritada görünmez (`revealAtTotalPlayers` / `REVEAL_THRESHOLDS`) — erken
  dönemde kalabalığı birkaç eve sıkıştırmak için.

## Kurulum

Node 18+ gerekir (geliştirme Node 22 ile yapıldı).

### 1. Realtime backend (`server/`)

```bash
cd server
npm install
npm run dev      # tsx watch, http://localhost:2567
```

Prodüksiyon için:

```bash
npm run build     # tsc -> build/
npm start          # node build/index.js
```

Ortam değişkeni: `PORT` (varsayılan `2567`).

### 2. Frontend (`web/`)

```bash
cd web
cp .env.local.example .env.local   # NEXT_PUBLIC_SERVER_URL'i ayarlayın
npm install
npm run dev       # http://localhost:3000
```

`NEXT_PUBLIC_SERVER_URL`, realtime backend'in adresidir (örn.
`http://localhost:2567` yerelde, `https://xxx.up.railway.app` prod'da).
Frontend bundan hem `/occupancy` REST çağrısını hem de Colyseus websocket
adresini (`http` → `ws`, `https` → `wss` dönüşümüyle) türetir.

Prodüksiyon build: `npm run build && npm start`.

## Deploy

- **Frontend** → Vercel. Proje kökü olarak `web/` seçin, `NEXT_PUBLIC_SERVER_URL`
  ortam değişkenini realtime backend'in canlı adresine ayarlayın.
- **Realtime backend** → Railway/Render (kalıcı WebSocket destekleyen bir Node
  ortamı). Proje kökü olarak `server/` seçin; build komutu `npm run build`,
  start komutu `npm start`. Servisin verdiği canlı URL'i frontend'in
  `NEXT_PUBLIC_SERVER_URL` değişkenine yazın.

İki servis de doğrulandı: iki tarayıcı sekmesi aynı eve girip birbirini
görebiliyor, WASD/ok tuşlarıyla yürüme + mobil dokunmatik joystick, kafa üstü
sohbet balonları gerçek zamanlı senkronize oluyor, evlerin doluluk/parlama
durumu canlı güncelleniyor, küfür filtresi mesaj görünmeden önce devreye
giriyor, report sonrası iki taraf artık aynı oda örneğine düşmüyor ve 18 yaş
altı giriş engelleniyor.

## MVP'de bilinçli olarak YOK (sonraya)

Brief'teki karara sadık kalınarak şunlar kodlanmadı:

- Ödeme, kozmetik satışı, avatar skinleri.
- Sesli sohbet (WebRTC) — şimdilik yalnızca metin.
- Özel/kişiselleştirilebilir odalar, sponsorlu binalar.
- Kalıcı hesaplar / giriş-şifre (anonimlik ilkesi gereği hiç eklenmeyecek).

## Sanat yönü

Tüm görseller (karakter, evler, ağaçlar, sokak lambaları) `web/game/scenes/BootScene.ts`
içinde vektör olarak (Phaser `Graphics` → `generateTexture`) baştan çizilir —
hiçbir hazır/telifli asset kullanılmaz. Renk paleti ve doku anahtarları
`web/game/config.ts` içinde merkezîleştirilmiştir; gerçek illüstrasyonlarla
değiştirmek için tek yapılması gereken bu texture key'lerini gerçek bir
spritesheet loader'a yönlendirmektir (`ART.useVectorPlaceholder` bayrağı bu
geçişi işaretlemek için oradadır).
