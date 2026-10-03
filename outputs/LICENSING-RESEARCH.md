# Orbiter — LSFG-VK örneği ve lisans önerisi

Araştırma: 3 Ekim 2026. Sonraki kullanıcı onayıyla GPLv3 + Ko-fi + Store yönü kabul edildi ve ilk prototip GPL-3.0-only olarak kuruldu. Aşağıdaki öneri bölümü karar öncesi araştırmadır. Decky ekibine mesaj gönderilmeyecek; cihaz testleri ve Store review hâlâ bekliyor.

## Doğrulanan LSFG ayrımı

1. Lossless Scaling ayrı, satın alınan ürün. Plugin README'si kullanıcıdan Steam'de satın alıp kurmasını ve lsfg-vk branch'ini seçmesini istiyor. Bu, plugin'in kendi lisansıyla aynı şey değil.
2. lsfg-vk motoru: geliştiricinin 27 Ağustos 2026 yazısı v1 MIT, v2 geliştirme döneminde GPLv3, yeni v2 kaynakta CC BY-NC-ND 4.0 değişimini anlatıyor. Güncel sitesi bu lisansı ve kaynak repo bağlantısını gösteriyor. Site Ko-fi ve GitHub Sponsors bağlantıları içeriyor.
3. decky-lsfg-vk arayüzü: repository LICENSE ve package.json BSD-3-Clause; README Ko-fi desteği sunuyor. Güncel README manuel ZIP kurulumunu tarif ediyor. Motor lisansı ile arayüz lisansı birbirinin yerine kullanılamaz; LICENSE dosyasındaki eski üçüncü taraf MIT bildirimi güncel v2 motoru için genel izin kanıtı değildir.

Decky stable store JSON'u okundu: https://plugins.deckbrew.xyz/plugins içinde visible=true, Decky LSFG-VK id=113, version=0.12.2. Database submodule commit'i 56c493184fc3960e3b33aa789fad618962c339ae; bu commit'in package.json'u sürüm 0.12.2, lisans BSD-3-Clause gösteriyor. Yeni v2 motorun aynı şartlarla Store'da kabul edildiği sonucu çıkarılamaz. Güncel repo README'sinin manuel kurulum tarif etmesi de mağazadan çıkarılma nedenini veya lisans nedeniyle ret kararını kanıtlamaz.

## Orbiter için öneri, karar değil

GPL-3.0 ile public kaynak repo, ücretsiz özellikler, Ayarlar/Hakkında ve README'de isteğe bağlı Ko-fi desteği, birincil dağıtım Decky Store. Exact only/or-later seçimi ve third-party uyumu implementation/paket incelemesinde kesinleşir.

GPL dağıtılan türevler için kaynak, aynı lisans ve değişiklik/telif bildirimleri yükümlülükleri getirir. Ticari kullanım, fork ve değişiklik yapma hakları vardır; Ko-fi linkinin korunmasını zorunlu kılmaz. Bu yüzden ticari klon veya link değiştirmeyi tamamen engellemek isteyen kullanıcı için tam çözüm değildir. Bağış beklenen/garantili gelir olarak bütçelenmemeli.

Önerinin gerekçesi: bu plugin'in değeri özel algoritma veya özel veri değil; resmi takvimi Deck üzerinde kullanışlı ve bakımı yapılan bir akışa dönüştürmek. Store erişimi ve güncelleme kolaylığı, özgün proje/maintainer görünürlüğü ve güvenilir resmi sürüm donasyon modelini destekleyebilir. Bu bir ürün değerlendirmesi, ölçülmüş gelir/fork davranışı iddiası değildir.

Ko-fi open-source ile çelişmez. BSD lisanslı ve Ko-fi bağlantılı Decky LSFG-VK somut model örneği; ne kadar gelir elde ettiği hakkında çıkarım yapılmadı. MIT'ye göre GPL, kodun türev dağıtımda kapatılmasına karşı farklı koruma verir; fork'u engellemek için seçilmez.

CC BY-NC-ND, lsfg-vk geliştiricisinin seçimi olsa da Orbiter yazılımı için önerilmiyor. Creative Commons yazılım lisansları olarak CC lisanslarını önermiyor. Kısıtlı source-available modelin Decky Store tarafından genel kabul edildiği araştırmayla kesinleşmedi; bu yol benimsenmiş sayılmıyor. Araştırma belirsizliğini otomatik izin veya kesin ret olarak yorumlama.

Decky'nin AI/LLM kod politikası önceki araştırmada belirsizdi; lisans tercihi tek başına Store kabulünü garanti etmez. Kullanıcı ekibe soru istemiyor; politika araştırma notu olarak kalır.

## Kaynaklar

- [lsfg-vk lisans değişikliği](https://lsfg-vk.dev/blog/important-changes-to-lsfg-vk/)
- [lsfg-vk güncel site](https://lsfg-vk.dev/)
- [Decky arayüzü README](https://github.com/xXJSONDeruloXx/decky-lsfg-vk/blob/main/README.md)
- [Decky arayüzü lisansı](https://github.com/xXJSONDeruloXx/decky-lsfg-vk/blob/main/LICENSE)
- [Database](https://github.com/SteamDeckHomebrew/decky-plugin-database/blob/main/.gitmodules)
- [Stable mağaza verisi](https://plugins.deckbrew.xyz/plugins)
- [GPLv3 izin/koşulları](https://choosealicense.com/licenses/gpl-3.0/)
- [CC yazılım lisansı önerisi](https://creativecommons.org/faq/#can-i-apply-a-creative-commons-license-to-software)
