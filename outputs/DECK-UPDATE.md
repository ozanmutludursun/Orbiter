# Yerel URL ile Deck testi

Mac ve Steam Deck aynı yerel ağda olmalı. Mac açık ve servis çalışıyor olmalı.

Servisi proje klasöründe başlat:

```sh
python3 scripts/serve_deck_zip.py --bind MAC-YEREL-IP
```

Servisin yazdırdığı anahtarlı URL'yi Decky Settings → Developer → Install Plugin from URL alanına gir. Tam `http://` önekini kullan. URL rastgele 192-bit bir erişim anahtarı içerir; paylaşma. Anahtar yalnızca Git dışında tutulan `work/deck-download-key.txt` dosyasında saklanır. Güncellemelerde aynı URL ile mevcut Orbiter üzerine kur; önce kaldırma. Ayarların korunmasını cihaz testinde doğrula.

`npm run package` güncel kurulum ZIP'ini üretir. Servis her istekte bu paketi yeniden okur; yeniden başlatmak gerekmez. ZIP başka bir sürüm numarasıyla üretilirse de package.json üzerinden doğru dosya seçilir. Cache kapalıdır. Yalnızca doğru anahtarlı ZIP yolu sunulur; klasör listesi ve kullanıcı ayarları sunulmaz. Anahtarsız istekler 404 alır. Kurulum ZIP'i plugin kodunu içerir; linke sahip cihazlar indirebilir. Bu servis güvenilen yerel ağdaki cihaz testi içindir. Eksik build sırasında 503 döner; paketleme bitince tekrar dene.

Mac IP'si değişirse URL'yi ve servisin bind adresini güncelle. Servisi durdurmak için Ctrl+C. Erişim olmazsa önce Deck tarayıcısında aynı URL'yi dene; ağ ayrımı veya macOS firewall iznini kontrol et.
