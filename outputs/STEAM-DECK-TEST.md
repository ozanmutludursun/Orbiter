# Orbiter — ilk Steam Deck testi

Hedef cihaz: kullanıcının Steam Deck'i, SteamOS Gaming Mode, Decky Stable v3.2.9. Güncel paket 0.1.13. Önceki cihaz testinde veri, sayaçlar, resmi ikonlar ve manuel Steam toast'ı çalıştı. Bu tur kompakt native satırları, başlık altındaki kaydırmayı ve ikonlu bildirim içeriğini doğruluyor. Mac önizlemesi Steam görünümünü ve gamepad odağını doğrulayamaz.

## 0.1.13 veri düzeltmesi

1. Yeni orbiter.zip'i mevcut kurulumun üzerine yükle; Settings → About'ta v0.1.13 gör. Eski backend kalırsa Deck'i yeniden başlat.
2. Refresh ile resmi takvimi yenile. Schedule unavailable / str has no attribute get hatası kalkmalı. Full schedule → Map içinde Pendola Pass görünmeli; seçince bu haritaya ait resmi kayıtlar gelmeli.
3. Conditions'ta ARC Frigate, Redirection ve Uncovered Caches görünmeli. Redirection'ın gözlemlenen harita listesinde Pendola Pass olmalı; diğer haritalar tahmin edilerek eklenmemeli. Eski region ve takip tercihleri korunmalı. Track all açıksa yeni condition'lar otomatik kapsanır, bireysel seçimler korunur.
4. Aşağıdaki 0.1.12 native UI ve doğal bildirim kontrolleri hâlâ geçerli; bu build onların düzenini değiştirmiyor.

## 0.1.12 hızlı kontrol

1. Yeni orbiter.zip'i mevcut kurulumun üzerine yükle; Settings → About'ta v0.1.12 gör. Eski backend kalırsa Deck'i yeniden başlat.
2. Paneli en üste getir, sonra listenin sonuna kadar controller ile kaydır. Orbiter başlığı altında boşluk olmalı; içerik başlıkla veya alttaki A/B alanıyla çakışmamalı. Yıldız/cog/refresh/back kontrolleri odaklı ve odaksız 32px kare kalmalı.
3. Conditions'ta büyük condition butonları yerine ikon, ad, harita özeti ve iki küçük aksiyon içeren native satırlar görünmeli. Uzun adlar okunmalı. Yıldız takip durumunu değiştirmeli; ok haritaları panel içinde açmalı. B önce haritaları kapatıp odağı oka geri vermeli, sonra Settings'a dönmeli. Track all native toggle'ı yeni condition'ları kapsamalı.
4. Settings → Notifications → Test notification. Artık takip edilen bir upcoming/active condition'ın resmi ikonu ve condition + map metni görünmeli. Sound ve Toast duration ayarları korunmalı. Takip edilen güncel event yoksa genel test mesajı gösterilir. Test oyun kapalıyken ve mute açıkken de bilerek gönderilir; normal uyarı politikası değişmez.
5. Normal bildirim için takip edilen bir event'i bekle: Gaming'de ARC açık olmalı, Notifications açık olmalı ve mute kapalı olmalı. Advance reminder veya At start ayarına göre gerçek Steam toast'ını panel kapalıyken kontrol et. Farklı condition'lar birleşirse her satır kendi ikon/ad/haritasını taşımalı. Otomatik teslimatın cihaz doğrulaması henüz tamamlanmadı.

## Kurulum

1. Deck'te Desktop Mode → Chrome → GitHub hesabına giriş yap. Private Orbiter reposunun [Development build](https://github.com/ozanmutludursun/Orbiter/releases/tag/dev) sayfasında Assets altındaki `orbiter.zip` dosyasını Downloads'a indir. ZIP'i açma; GitHub'ın Source code arşivleri kurulum paketi değil. Sonraki geliştirme güncellemelerinde aynı sayfadaki dosya yenilenir; mevcut Orbiter üzerine yeni ZIP'i kur ve ayarların korunduğunu doğrula.
2. Gaming Mode'da **… → Decky → dişli → Developer** bölümüne gir. Developer bölümü görünmüyorsa Decky ayarlarından Developer Mode'u aç.
3. **Install Plugin from ZIP File** alanındaki Browse/dosya seçimiyle bu ZIP'i seç ve Orbiter kurulumunu tamamla. Dil/sürüm nedeniyle etiketler biraz farklı olabilir.
4. Decky listesinde Orbiter'i aç. Yeni kurulumda önce sunucu bölgesi seçimi görünür; seçimin kaydedilir ve ana panel açılır. Sonraki açılışta bu adım atlanır. Gerekirse Steam Deck'i yeniden başlatıp tekrar kontrol et.

ZIP açılabilirliği, gerekli frontend/backend dosyaları, lisans ve root/debug bayraklarının olmaması Mac'te kontrol edildi. Resmî Decky Developer ekranı yerel ZIP dosya seçimiyle kurulumu destekliyor: https://github.com/SteamDeckHomebrew/decky-loader/blob/main/frontend/src/components/settings/pages/developer/index.tsx

## İlk tur: panel ve oyun algılama

Önce bildirimleri kapalı bırak.

1. ARC kapalıyken Orbiter'i aç; kendi sunucu bölgeni seç. Resmî takvim yüklenmeli, aktif/yaklaşan koşullar ve ikonlar görünmeli. Gaming modunda durum “Waiting for ARC” olmalı.
2. Controller ile Settings, Gaming/Always/Panel seçenekleri, bölge seçimi, Manage conditions ve bir condition'ın harita tercihlerini dene. A seçmeli, B geri dönebilmeli; odağın kaybolması veya tıklamada toplu soluklaşma olmamalı.
3. Full schedule görünümünü aç, kaydır ve geri dön.
4. Activity'yi Gaming bırakıp ARC Raiders'ı başlat. Paneli tekrar açınca “Tracking” görünmeli. Gerekirse bir heartbeat aralığı (yaklaşık 10 saniye) bekle.
5. ARC'yi kapat. Durum tekrar “Waiting for ARC” olmalı. Panel açık olsa da sürekli arka plan takibi sürmemeli.

İlk geri bildirim: plugin açıldı mı; takvim yüklendi mi; controller ve geri dönüş düzgün mü; ARC açma/kapatma algılandı mı? Hata varsa ekrandaki mesaj, Decky Stable sürümü ve mümkünse görüntü yeterli başlangıç verisi.

## İkinci tur: ilk tur geçtikten sonra

- Önce Test notification ile gerçek Steam toast yolunu kontrol et. Ardından takip edilen yaklaşan bir condition için advance reminder ve başlangıç uyarısını dene. Panel kapalıyken gerçek Steam toast'ını, sessizliği ve süreyi kontrol et. Zamanlanmış uyarı testi için gerçek event'i beklemek gerekir; cihaz build'inde Mac demo timeline yok.
- Oturumluk mute, Always'de diğer oyunlarda izin ve Panel modunda panel kapanması.
- Offline: son takvim korunmalı; veri eskidiğinde stale görünmeli ve yeni bildirim çıkmamalı.
- Uyku/uyanma ve plugin/Steam UI reload: kaçırılan uyarılar topluca gelmemeli, aynı uyarı tekrar gönderilmemeli.

Diğer işletim sistemleri bu testin kapısı değil. Store gönderimi bu cihaz testi ve sonraki düzeltmelerden sonra.
