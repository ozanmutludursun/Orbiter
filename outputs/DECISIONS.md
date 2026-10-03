# Orbiter — güncel kararlar ve açık noktalar

3 Ekim 2026. İlk geliştirme prototipi 0.1.0 hazır; cihaz kurulumu/yayın yapılmadı.

Kullanıcı GPLv3 + Ko-fi + Store yönünü kabul etti. Uygulama GPL-3.0-only olarak kuruldu; üçüncü taraf lisansları ayrı korundu. Güncel uygulama durumu ROADMAP.md ve MAC-PREVIEW.md içinde. Decky ekibine mesaj gönderilmeyecek.

## Kesinleşen kapsam

SteamOS Gaming Mode tek öncelikli hedef; gerçek cihaz kullanıcının Steam Deck'i. iMac araştırma, tasarım, build ve çekirdek testleri için kullanılabilir. Diğer Decky sistemlerinin sorunları SteamOS sürümünü engellemez. MetaForge kullanılmayacak; doğrudan arcraiders.com kullanılacak.

Decky Store birincil dağıtım/güncelleme hedefi. Kullanıcı kaynak kodun denetlenmesine karşı değil; private repo tercihi önceki yanlış yorumdu. GPL açık kaynak ve fork/yeniden dağıtıma izin veren copyleft modelidir; fork engelleme vaat edilmiyor. Manuel ZIP beta/cihaz testi içindir; Store hedefinin yerine geçmez.

## Resmî veri ve ikon doğrulaması

Next.js verisinde liveEntries, conditionItems, mapNames ve bölgesel zamanlar mevcut. Condition bağlantısının HTML'inde ad, href slug'ı ve inline SVG birlikte bulunuyor. Matriarch ve Hidden Bunker doğrulandı. Bugünkü katalogdaki 14 condition'ın 13'ünün ikonu ana görünümde bulundu; görünmeyen Prospecting Probes'un ikonu kendi condition sayfasında doğrulandı.

Uygulandı: ana sayfadan dinamik eşleme, eksik condition için sınırlı resmî condition-page okuması ve cache. İsim/ikonlar sabit listeye gömülmüyor. SVG temizleniyor; site kodu çalıştırılmıyor. Bu okuma teknik erişimi doğrular, public API sözleşmesi veya varlık kullanım lisansı sağlamaz. Kullanıcı format değişirse adapter'ın yeni sürümle güncellenmesini kabul ediyor.

Condition harita seçenekleri yalnızca resmî takvimde gözlenen eşleşmelerden üretilir. Eşleşmeler cache içinde condition bazında saklanır ve sonraki takvim aralıklarında korunur; yeni eşleşmeler otomatik eklenir. Yeni haritanın varlığı, bütün condition'ların o haritada bulunacağı anlamına gelmez. “All maps” mevcut ve gelecekte yayımlanan eşleşmeleri kapsar. Eski kullanıcı tercihleri silinmez; takvimde olmayan eşleşmeler bildirim üretmez.

## Lisans ayrımı

Public repo açık kaynak lisansıyla aynı şey değildir. Source-available lisans; ücretsiz kullanım, inceleme ve kişisel değişiklik, ayrıca Decky ekibine build/paketleme/Store dağıtım hakları tanıyıp türetilmiş ürünlerin dağıtımını veya ticari yeniden kullanımı sınırlayabilir. Bu model open-source diye sunulmamalıdır. Store kabulü henüz doğrulanmadı.

GitHub public repo koşulları platform içi view/fork hakları verir; bütün GitHub fork'larını yasaklama vaat edilmez. Türetilmiş bağımsız ürünün dağıtım hakkı bundan farklıdır. Orbiter kodunu kullanmadan aynı resmî veriden tracker yazmayı Orbiter lisansı engellemez. Ko-fi resmi sürümün bakımına destek içindir; fork ihtimali bunu anlamsız yapmaz. GPL de fork'u veya bağış linkini kaldırmayı engelleyen bir çözüm değildir.

Template BSD-3-Clause; @decky/api ve @decky/ui LGPL-2.1. Özgün kodun lisansı üçüncü taraf haklarını değiştiremez. Paketleme ve LGPL yükümlülükleri nihai lisansla beraber denetlenir.

Decky kuralları private/denetlenemeyen repo reddini ve ücretsiz/open-source plugin hedefini ifade ediyor. Kısıtlı source-available lisansın kabul edildiğini kesinleştiren kural veya doğrulanmış emsal bulunmadı. Store'a güncelleme doğrudan anlık push değil; submodule/commit PR ve review sürecidir.

## Sonraki adım

Mac önizlemesinden tasarım geri bildirimi; sonra kullanıcının Steam Deck'inde oyun algılama, controller odağı ve native toast testleri. Herhangi bir Store gönderimi yapılmadı. Önceki kısıtlı source-available modelinin araştırması tarihsel nottur; uygulanan lisans GPLv3'tür.

## Kaynaklar

- [Resmî takvim](https://arcraiders.com/map-conditions)
- [Prospecting Probes](https://arcraiders.com/map-conditions/prospecting-probes)
- [Decky submission](https://wiki.deckbrew.xyz/en/plugin-dev/submitting-plugins)
- [Plugin database](https://github.com/SteamDeckHomebrew/decky-plugin-database)
- [GitHub public repo hakları](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#d-user-generated-content)
- [Template lisansı](https://github.com/SteamDeckHomebrew/decky-plugin-template/blob/main/LICENSE)
- [API lisansı](https://github.com/SteamDeckHomebrew/loader-api/blob/main/LICENSE)
