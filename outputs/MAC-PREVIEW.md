# Orbiter — Mac önizlemesi

İlk çalışan prototip hazır. Tarayıcı önizlemesi ve Decky plugin'i aynı React arayüzünü ve Python veri/bildirim çekirdeğini kullanıyor. Swift uygulaması gerekmiyor; tasarım değişikliği iki tarafta da aynı yerde yapılıyor.

## Açılış

Bu çalışma oturumunda önizleme http://127.0.0.1:8765 adresinde açık. Tekrar başlatmak için `Orbiter Preview.command` dosyasını çift tıklayabilirsin. Terminal açık kalır; Ctrl+C sunucuyu durdurur. Aynı anda ikinci sunucu başlatma.

Terminal alternatifi:

```sh
cd /Users/ozanmutludursun/Documents/Orbiter
npm ci
npm run preview
```

Bu Mac'te Node, npm ve Python mevcut. Başka bir bilgisayarda Node 20.19+ veya 22.12+ ve Python 3.9+ gerekir. Servis yalnızca 127.0.0.1'e bağlanır; LAN'a açılmaz. Önizleme ayarları `work/preview-data` altında saklanır, Decky ayarlarıyla paylaşılmaz.

## Deneme akışı

1. Yeni kurulumda ilk ekran sunucu bölgesi seçimidir. Seçim kaydedilir; ana panel açılır ve sonraki açılışlarda tekrar sorulmaz. Mevcut önizlemede daha önce bölge seçildiyse doğrudan panel gelir. Saatler Mac'in yerel saat diliminde gösterilir.
2. Aktif ve yaklaşan condition'ları gör. Yıldız takip tercihini değiştirir. “Tracked” yalnızca seçimlerini gösterir.
3. “View full schedule” veya üstte “Wide view” ile geniş takvimi aç; harita filtresini dene.
4. Dişli simgesinden Gaming / Always / Panel çalışma modunu ve bildirimleri değiştir. Bildirim ayrıntıları açıkken görünür. “Manage conditions” ayrı takip ekranını açar; condition başına harita tercihleri burada. Bölge satırı seçenekleri açar. Tab / Shift+Tab, Enter, Escape veya fare kullanılabilir.
5. Üstte “ARC running” oyun açık/kapalı durumunu simüle eder. “Close panel” paneli kapatır; arka plan takibini moduna göre denemek için kullan.
6. Bildirim denemesi: ayarlardan bildirimleri aç, advance reminder'ı **1 min** yap. Sonra “Live schedule” düğmesine basarak demo modunu aç. İlk yaklaşan condition 65 saniye sonra başlar; 5 saniye sonra bir advance toast görünür. Sonraki demo event'ler 30 saniye aralıklıdır. Başlangıç uyarısını da açık bırakabilirsin.
7. “Demo timeline” düğmesiyle canlı takvime geri dön. Demo içeriğinin ad ve ikonları resmî kaynaktan gelir; sadece zamanlar sentetiktir. Demo olduğunu panel ayrıca gösterir.

Ko-fi için yer hazır: `defaults/config.json` içindeki `supportUrl` gerçek `https://ko-fi.com/profil` adresinle doldurulduğunda Hakkında alanında normal bir link gösterilir. Şimdilik adres verilmediği için link gizli. Frontend İngilizce; Türkçe/localization sonraki ürün kararı olabilir.

## Doğrulama sınırı

Mac'te canlı veri/ikon erişimi, ayarlar, filtreler, demo bildirim akışı ve build doğrulandı. Gerçek Steam game detection, controller odağı, QAM route geri dönüşü, oyun içi Steam toast konumu ve Deck sleep/resume davranışı cihaz testi bekliyor. Bu prototipin Store-ready olduğu iddia edilmiyor.

Kaynak kodu çalışma klasöründe. Geliştirme ZIP'i ve kaynak ZIP'i outputs altında üretilir; gerçek cihaz kurulumundan önce ROADMAP.md'deki cihaz kapılarını izleyeceğiz.
