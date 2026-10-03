# Orbiter — Decky araştırma notları

3 Ekim 2026 tarihinde kaynakların okunabilir araştırma kopyaları alındı. Sonrasında ilk 0.1.0 prototip ve Mac önizlemesi geliştirildi; cihaz kurulumu/Store yayını yapılmadı.

Güncel karar: SteamOS tek öncelik; MetaForge yok; GPL-3.0-only özgün kod + Ko-fi + Store. Aşağıdaki MetaForge ve kısıtlı lisans notları önceki seçeneklerin tarihsel araştırmasıdır; güncel yol haritası ve DECISIONS.md esas alınır.

## Güncel şablon ile eski wiki örneklerini ayır

[Getting Started](https://wiki.deckbrew.xyz/en/plugin-dev/getting-started) yararlı bir yapı anlatıyor, fakat ServerAPI.callPluginMethod ve lockfile 6.0 gibi eski örnekler içeriyor. Güncel resmî [template](https://github.com/SteamDeckHomebrew/decky-plugin-template) @decky/api ve @decky/ui kullanıyor; callable, definePlugin, addEventListener/removeEventListener ve toaster.toast örnekleri var. [Review sayfası](https://wiki.deckbrew.xyz/en/plugin-dev/review-and-testing) lockfile 9.0 istiyor. Template README pnpm 9 belirtiyor. Implementation başlangıcında sürümler tekrar doğrulanmalı.

Okunan template package.json: @decky/api ^1.1.3, @decky/ui ^4.11.0, @decky/rollup ^1.0.2, TypeScript ^5.6.2. Bunlar snapshot'taki aralıklar; 1.0 için şimdiden sabitlenmiş sürüm kararı değil. README'deki Node alt sınırını modern dependency engine gereklilikleriyle kontrol etmeden kullanma.

Python main.py içindeki async _main, _unload ve decky.emit; frontend event dinleyicileriyle beraber panel kapalıyken takip tasarımına uygun bir temel sunuyor. Native custom backend/binary gerekmiyor. Standart main.py ile native binary için backend/src klasörü aynı gereklilik değildir.

## Platform kapsamı

Decky öncelikle Steam Deck'i hedefliyor. Linux Big Picture'da kullanım kanıtı var; bu her dağıtım/Steam oturumu için otomatik garanti değil. Bazzite'nin güncel Gaming Mode açıklaması hem handheld hem HTPC ortamını kapsıyor. Normal masaüstü Steam görünümündeki Decky GUI erişimi ayrı bir açık istek olarak bulunuyor. Orbiter'in QAM/route/toast erişimi Gaming Mode veya Big Picture ortamıyla sınırlandırılarak test edilmeli.

- [Bazzite Gaming Mode](https://docs.bazzite.gg/Handheld_and_HTPC_edition/Steam_Gaming_Mode/)
- [Linux Big Picture konusu](https://github.com/SteamDeckHomebrew/decky-loader/issues/368)
- [Desktop GUI isteği](https://github.com/SteamDeckHomebrew/decky-loader/issues/784)

## Ko-fi ve API

[SteamGridDB plugin package.json](https://github.com/SteamGridDB/decky-steamgriddb/blob/main/package.json) içinde Ko-fi funding örneği bulunuyor. Bu Orbiter'in veya MetaForge kullanımının otomatik onayı değildir.

[MetaForge](https://metaforge.app/arc-raiders/api) public projelerde atıf/bağlantı ve monetize edilen projelerde önceden iletişim istiyor. Gönüllü bağışın istisna olduğu yazmıyor. Ko-fi kapsamı, ikon kullanımı ve cache/istemci trafiği yayın öncesi netleştirilmeli. Sayfa endpoint'lerin değişebileceğini belirtiyor; büyük istekleri sınırlayabilir ve cache kullanımını istiyor.

## Store politikası belirsizliği

[Submitting Plugins](https://wiki.deckbrew.xyz/en/plugin-dev/submitting-plugins) sayfası “any plugin that uses any LLM based code” ifadesini kullanıyor; aynı bölüm LLM-focused plugin'lerin reddedileceğini söylüyor. AI ile geliştirme yardımı ve runtime LLM özelliği arasındaki ayrım açıkça tanımlanmamış. Bu nedenle bu sohbetle geliştirilen bir plugin için Store kabulü varsayılmamalı; yetkili açıklama gerekli. Manuel sürümlü ZIP dağıtımı, Store kabulünden ayrı bir yoldur; veri kaynağı koşulları yine geçerlidir. Kuralları aşmak veya geliştirme yöntemini gizlemek planın parçası değildir.

## Test gerekliliği

[Review and Testing](https://wiki.deckbrew.xyz/en/plugin-dev/review-and-testing) standart Python + React ve bağımlılık sorunu yaratacak native binary olmayan plugin'ler için latest Stable veya Beta'da işlevsel test anlatıyor. Custom/native backend durumunda Preview gereklilikleri farklı. Gönderim anında güncel PR checklist'i kontrol edilmeli; Store kabulü ekip review'ına bağlı.

## Yerel referanslar

work/references/decky-2026-10-03/manifest.json kaynak URL'lerini, alınma tarihini ve dosya boyutlarını içeriyor. Kopyalar hareketli main branch URL'lerinden alındı; commit'e sabitlenmiş arşiv değildir. Bu kopyalar araştırma için saklandı, çalıştırılmadı ve üretim kodu gibi projeye kurulmadı.
