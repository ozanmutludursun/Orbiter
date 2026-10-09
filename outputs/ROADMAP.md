# Orbiter — uygulanabilir yol haritası

Güncelleme: 9 Ekim 2026. 0.1.14 public paket/update hazırlığı tamamlandı; canlı takvim, ikonlar ve manuel notification testi Decky Stable v3.2.9 üzerinde gözlendi. Doğal notification akışı ve son kompakt layout için cihaz doğrulaması devam ediyor. Özel Decky update servisi hazırlandı; henüz yayında değil.

## Netleşen kararlar

- Birincil hedef Steam Deck / SteamOS Gaming Mode. Diğer Decky ortamları çalışırsa uyumlu; ilk sürümü engelleyen destek hedefleri değil.
- Tek veri kaynağı resmî arcraiders.com takvimi. MetaForge yok. SSR içindeki yapılandırılmış takvim, bölgesel zamanlar ve condition bağlantılarındaki SVG ikonlar okunuyor. Dokümante edilmiş public API sözleşmesi değil; format değişirse release çıkarırız.
- Orijinal kod GPL-3.0-only, temel işlevler ücretsiz; gerçek adres netleşene kadar Support alanı placeholder. Kullanıcı 9 Ekim'de mevcut Orbiter reposunun public yapılmasını onayladı; aynı repo kurulum ZIP'i ve karşılık gelen GPL kaynak paketini barındıracak. Özel store, resmî kataloğu koruyarak Decky'nin yerleşik updater'ını kullanacak. GPL, özel kullanım/ücretli dağıtıma izin verir; dağıtılan türevlerin kaynak/lisans yükümlülüklerini korur, kapalı kaynak olarak yeniden dağıtıma izin vermez.
- Kompakt QAM paneli; ayarlar ayrı içerik, geniş takvim ayrı Decky route'u. Mac önizlemesi aynı React bileşenlerini ve Python çekirdeğini kullanıyor.
- Otomatik mod ARC Raiders App ID 1808500'e bağlı. Bildirimler varsayılan kapalı, ses kapalı; bölge ilk kullanımda kullanıcı tarafından seçilir.

## 1. Kaynak ve Mac prototipi — tamamlandı

Resmî sayfadan dinamik condition/harita listesi ve beş bölgenin zamanı okunuyor. Ana sayfada olmayan ikonlar için sınırlı condition-page okuması, SVG temizleme ve nötr yedek var. Takvim/ikon cache'i ve ayarlar yerel dosyalarda tutuluyor; oyunun koduna veya hesabına erişilmiyor.

Mac arayüzü: aktif/yaklaşan koşullar, geri sayım, takip yıldızı, takip filtresi, bölge seçimi, geniş takvim, harita filtresi, ayrı ayarlar, oturumluk susturma. Demo zaman çizelgesi ile simüle oyun/panel durumu ve toast denemesi çalışıyor. Kullanım: MAC-PREVIEW.md.

Tamamlanma kanıtı: canlı resmî veri ve 14 condition ikonunun okunması; TypeScript kontrolü, Decky build ve browser build; çekirdek testleri ve tarayıcı etkileşim kontrolü. Provider sayısı değişebilir; bu sayılar kodda sabit değil.

## 2. Steam Deck entegrasyonunu doğrula — sıradaki adım

Geliştirme ZIP'i cihazda çalışıyor. Son kompakt layout ve doğal bildirim akışını doğrula; ilk HTTPS/backend kurulum sorunları giderildi.

1. SteamOS Gaming Mode + Decky Stable'da plugin yükle. Root/debug bayrağı olmadan backend'in açıldığını ve resmî HTTPS erişimini doğrula.
2. 1280×800 QAM panelini, kaydırmayı, tüm kontrolleri D-pad/joystick/A/B ile dene. Settings dönüşü, geniş takvim route'u ve odağın kaybolmaması yayından önce gerekli.
3. ARC zaten açıkken plugin yükleme, ARC başlatma/kapatma ve başka oyuna geçişi dene. Algılama Router.RunningApps + lifetime dinleyicisi adaptöründe; Steam iç API'si değişirse bilinmeyen durum gösterilir.
4. Panel kapalıyken oyun açık/kapalı; auto/always/panel modlarını doğrula. Heartbeat kaybı 35 saniyede takibi kapatmalı. Native Steam toast'ın süre, ses, yerleşim ve Steam bildirim ayarlarıyla davranışını gör.
5. Uyku/uyanma, Steam UI reload, plugin reload/unload, offline ve bölge değişimini dene. Eski uyarılar topluca gönderilmemeli; stale veri bildirim üretmemeli.

Tamamlanma ölçütü: bu akışların gerçek cihazda kaydı; özellikle controller odağı, oyun algılama ve toast. Mac'teki başarı bunların kanıtı değil. Diğer OS cihazları gerekli değil.

## 3. Kullanıcı geri bildirimiyle küçük beta — cihaz aşamasından sonra

- Panel yoğunluğu/okunabilirliği ve notification tercihlerini gerçek oynama sırasında düzelt.
- Map/condition ad değişikliklerinin takip tercihlerine etkisini gözlemle. Kalıcı upstream ID yok; condition slug kullanılıyor. Günlük takvimden kaybolan tercih silinmez.
- Stale eşiği (20 dk), refresh (5 dk), lead time seçenekleri ve eşzamanlı toast sınırlarını gerçek kullanımda değerlendir. Yeni özellik eklemeyi öncelik yapma.
- Türkiye'de kullanılabilir ödeme kanalı netleşince Support'a gerçek adres bağla. Support bildirimi/nag ekranı yok.
- Gerekirse dil tercihi ekle; ilk arayüz İngilizce.

## 4. Release hazırlığı ve Decky update kanalı

9 Ekim 2026 kontrolünde resmî Store addition checklist'i, kodun çoğunluğunun üretken AI tarafından yazılmamış olmasını istiyor. Bu projede o beyan verilemiyor; resmî Store'a şu an gönderim yapılmayacak. Politika değişirse tekrar değerlendirilecek.

`distribution/README.md`: public Orbiter reposunda sürümlü ZIP + GPL kaynak ZIP'i; resmî plugin kataloğu ile Orbiter'ı birleştiren CORS uyumlu Cloudflare Worker. Kullanıcı Decky'de özel store adresini bir kez girer; sonraki sürümleri Decky'nin update ekranından kurar. Diğer plugin'lerin update listeleri korunur. Paket hazırlama ve store protokol testleri mevcut; public yayın onaylandı, hosting/deployment ve gerçek Deck update testi henüz tamamlanmadı.

- Orbiter reposu kullanıcı onayıyla public yapıldı; 0.1.14 ZIP + GPL kaynak ZIP'i yayımlandı ve anonim indirme/hash doğrulandı. ZIP'e ayar/live cache taşıma; güncellemeler Decky settings/runtime dizinlerini korumalı.
- Hosting maliyeti sıfır kalacak: yalnızca Workers Free, domain/depolama/paid plan yok. Günlük hesap kotası 100.000 istek, CPU 10 ms/istek. Worker dry-run build'i geçti; hesap girişinden sonra Free plan doğrulaması ve deployment yapılacak.
- Kaynak/lisans paketini her kurulum ZIP'i ile birlikte yayımla; ekibe soru gönderilmeyecek.
- Güncel submission/review politikasını gönderim öncesinde tekrar oku. Otomatik anlık push yok; submodule/commit güncellemesi review'dan geçiyor.
- Build dev bağımlılıklarının npm audit uyarılarını yeniden değerlendir. Mevcut 7 high uyarı @decky/rollup → glob/braces build zincirinde; production dependency audit temiz. Bilinen bu durumu release notlarında kaybetme.
- Temiz kurulum, update, disable/unload ve uninstall testlerinden sonra 1.0 adayı. Store gönderimi ayrı yayın adımı.

## Kapsam sınırı

Loot/quest/inventory, hesap bağlantısı, oyun belleği, sürekli overlay, cloud sync, üçüncü taraf fallback, ayrı native Mac uygulaması, bağımsız updater ve ücretli özellik yok. Mac test önizlemesi geliştirme aracı; son kullanıcıya ayrı desktop ürün vaat edilmiyor.

## Teknik yapı

`defaults/orbiter_core`: standard-library Python source + engine. `main.py`: küçük Decky adapter. `src/shared`: ortak React UI. `src/index.tsx`: Steam/Decky adapter. `src/preview.tsx` ve `scripts/preview_server.py`: localhost Mac test ortamı.

Kaynaklar: [Decky template](https://github.com/SteamDeckHomebrew/decky-plugin-template), [Decky geliştirme wiki](https://wiki.deckbrew.xyz/en/plugin-dev/getting-started), [Review/testing](https://wiki.deckbrew.xyz/en/plugin-dev/review-and-testing), [Submission](https://wiki.deckbrew.xyz/en/plugin-dev/submitting-plugins), [Resmî ARC Raiders takvimi](https://arcraiders.com/map-conditions). Araştırma ayrıntıları RESEARCH.md ve LICENSING-RESEARCH.md'de; eski notların kararları bu roadmap ile güncellendi.
