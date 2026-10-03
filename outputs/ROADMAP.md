# Orbiter — uygulanabilir yol haritası

Güncelleme: 3 Ekim 2026. İlk geliştirme prototipi 0.1.0 hazır; Steam Deck kurulumu ve Store gönderimi yapılmadı.

## Netleşen kararlar

- Birincil hedef Steam Deck / SteamOS Gaming Mode. Diğer Decky ortamları çalışırsa uyumlu; ilk sürümü engelleyen destek hedefleri değil.
- Tek veri kaynağı resmî arcraiders.com takvimi. MetaForge yok. SSR içindeki yapılandırılmış takvim, bölgesel zamanlar ve condition bağlantılarındaki SVG ikonlar okunuyor. Dokümante edilmiş public API sözleşmesi değil; format değişirse release çıkarırız.
- Orijinal kod GPL-3.0-only, temel işlevler ücretsiz; Ko-fi Hakkında bölümünde isteğe bağlı link. Store ana dağıtım/update hedefi. GPL, fork/yeniden dağıtıma izin verir ve dağıtılan türevlerin kaynak/lisans yükümlülüklerini korur; fork'u yasaklama modeli değil.
- Kompakt QAM paneli; ayarlar ayrı içerik, geniş takvim ayrı Decky route'u. Mac önizlemesi aynı React bileşenlerini ve Python çekirdeğini kullanıyor.
- Otomatik mod ARC Raiders App ID 1808500'e bağlı. Bildirimler varsayılan kapalı, ses kapalı; bölge ilk kullanımda kullanıcı tarafından seçilir.

## 1. Kaynak ve Mac prototipi — tamamlandı

Resmî sayfadan dinamik condition/harita listesi ve beş bölgenin zamanı okunuyor. Ana sayfada olmayan ikonlar için sınırlı condition-page okuması, SVG temizleme ve nötr yedek var. Takvim/ikon cache'i ve ayarlar yerel dosyalarda tutuluyor; oyunun koduna veya hesabına erişilmiyor.

Mac arayüzü: aktif/yaklaşan koşullar, geri sayım, takip yıldızı, takip filtresi, bölge seçimi, geniş takvim, harita filtresi, ayrı ayarlar, oturumluk susturma. Demo zaman çizelgesi ile simüle oyun/panel durumu ve toast denemesi çalışıyor. Kullanım: MAC-PREVIEW.md.

Tamamlanma kanıtı: canlı resmî veri ve 14 condition ikonunun okunması; TypeScript kontrolü, Decky build ve browser build; çekirdek testleri ve tarayıcı etkileşim kontrolü. Provider sayısı değişebilir; bu sayılar kodda sabit değil.

## 2. Steam Deck entegrasyonunu doğrula — sıradaki adım

Geliştirme ZIP'ini cihazda dene. Store release'i veya cihaz kurulumunu bu çalışma oturumunda yapmadık.

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
- Ko-fi gerçek profil adresini yapılandır; placeholder veya support bildirimi koyma.
- Gerekirse dil tercihi ekle; ilk arayüz İngilizce.

## 4. Release hazırlığı ve Store — beta sonrası

- Public kaynak repo, README, lisans/üçüncü taraf notices, issue adresi ve Store görselini tamamla. ZIP'e ayar/live cache taşıma; güncellemeler Decky settings/runtime dizinlerini korumalı.
- GPL ve funding modelini mevcut GPL/Ko-fi Store plugin örnekleriyle doğruladık. Nihai kabul Store review sürecine bağlı; ekibe soru gönderilmeyecek.
- Güncel submission/review politikasını gönderim öncesinde tekrar oku. Otomatik anlık push yok; submodule/commit güncellemesi review'dan geçiyor.
- Build dev bağımlılıklarının npm audit uyarılarını yeniden değerlendir. Mevcut 7 high uyarı @decky/rollup → glob/braces build zincirinde; production dependency audit temiz. Bilinen bu durumu release notlarında kaybetme.
- Temiz kurulum, update, disable/unload ve uninstall testlerinden sonra 1.0 adayı. Store gönderimi ayrı yayın adımı.

## Kapsam sınırı

Loot/quest/inventory, hesap bağlantısı, oyun belleği, sürekli overlay, cloud sync, üçüncü taraf fallback, ayrı native Mac uygulaması, bağımsız updater ve ücretli özellik yok. Mac test önizlemesi geliştirme aracı; son kullanıcıya ayrı desktop ürün vaat edilmiyor.

## Teknik yapı

`defaults/orbiter_core`: standard-library Python source + engine. `main.py`: küçük Decky adapter. `src/shared`: ortak React UI. `src/index.tsx`: Steam/Decky adapter. `src/preview.tsx` ve `scripts/preview_server.py`: localhost Mac test ortamı.

Kaynaklar: [Decky template](https://github.com/SteamDeckHomebrew/decky-plugin-template), [Decky geliştirme wiki](https://wiki.deckbrew.xyz/en/plugin-dev/getting-started), [Review/testing](https://wiki.deckbrew.xyz/en/plugin-dev/review-and-testing), [Submission](https://wiki.deckbrew.xyz/en/plugin-dev/submitting-plugins), [Resmî ARC Raiders takvimi](https://arcraiders.com/map-conditions). Araştırma ayrıntıları RESEARCH.md ve LICENSING-RESEARCH.md'de; eski notların kararları bu roadmap ile güncellendi.
