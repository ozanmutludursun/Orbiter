# Orbiter — ilk Steam Deck testi

Hedef cihaz: kullanıcının Steam Deck'i, SteamOS Gaming Mode, Decky Stable. Paket 0.1.0 geliştirme build'i; cihaz test sonuçları henüz alınmadı.

## Kurulum

1. `Orbiter-0.1.0-dev.zip` dosyasını Mac'ten Deck'in Downloads klasörüne aktar. USB bellek veya mevcut dosya aktarım yöntemin kullanılabilir. ZIP'i açma; source ZIP'i kurulum paketi değil.
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

- Bildirimleri aç, takip edilen yaklaşan bir condition için advance reminder ve başlangıç uyarısını dene. Panel kapalıyken gerçek Steam toast'ını, sessizliği ve süreyi kontrol et. Takvimde yakın bir başlangıç yoksa gerçek event'i beklemek gerekir; cihaz build'inde Mac demo timeline yok.
- Oturumluk mute, Always'de diğer oyunlarda izin ve Panel modunda panel kapanması.
- Offline: son takvim korunmalı; veri eskidiğinde stale görünmeli ve yeni bildirim çıkmamalı.
- Uyku/uyanma ve plugin/Steam UI reload: kaçırılan uyarılar topluca gelmemeli, aynı uyarı tekrar gönderilmemeli.

Diğer işletim sistemleri bu testin kapısı değil. Store gönderimi bu cihaz testi ve sonraki düzeltmelerden sonra.
