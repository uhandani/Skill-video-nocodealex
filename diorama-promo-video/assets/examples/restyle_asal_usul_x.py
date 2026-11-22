"""Build video.json for 'asal usul huruf x' from caption timings read off the original video."""
import json, sys

# (start_seconds, word) per scene — read from the burned-in captions (yellow = spoken word)
S = [
 dict(type="board", title="Kenapa selalu x?", rows=[{"glyphs": ["x"], "highlight": [0]}],
      w="0 pernah|.5 kepikiran|.8 gak|1 sih|1.3 kenapa|1.5 di|2 matematika|2.5 yang|2.8 dicari|3 itu|3.5 selalu|3.7 x"),
 dict(type="board", title="Bukan a, bukan b", rows=[{"glyphs": ["a", "b", "x"], "struck": [0, 1], "highlight": [2]}],
      w="4.5 bukan|4.8 a|5 bukan|5.3 b|5.5 tapi|6 x"),
 dict(type="spotlight", title="Gue iseng cari tahu",
      w="6.5 jadi|6.7 gue|7 iseng|7.3 cari|7.5 tahu|7.8 dan|8 ternyata|8.5 ceritanya|9 seru|9.5 banget"),
 dict(type="card", title="Versi viral", heading="Kata internet:", lines=["x berasal dari", "bahasa Arab:", "syai' = “sesuatu”"], highlights=["syai'", "sesuatu"],
      w="10.5 nah|10.6 ada|11 satu|11.2 versi|11.5 yang|11.7 viral|12 banget|12.2 di|12.5 internet|13 katanya|13.2 x|13.4 itu|13.5 asalnya|13.8 dari|14 bahasa|14.5 arab|15 syai|15.5 artinya|16 sesuatu"),
 dict(type="board", title="Syai' → xei → x", rows=[{"glyphs": ["syai'", "xei", "x"], "arrows": True, "highlight": [2]}],
      w="16.5 terus|16.7 pas|17 diterjemahin|17.5 ke|18 bahasa|18.3 spanyol|18.6 bunyi|18.8 sy|19 itu|19.5 ditulis|19.8 pakai|20 huruf|20.5 x|20.7 makanya|21 jadi|21.3 x"),
 dict(type="lineup", title="Masuk akal?", count=3, signs=["Masuk akal?", "Hmm…", "Iya sih"],
      w="21.8 kedengerannya|22.4 masuk|23 akal|23.5 kan"),
 dict(type="before-after", title="Kata sejarawan", stamp="MITOS", rewrite=False,
      w="24 tapi|25 sejarawan|26 matematika|26.5 bilang|27 bukti|27.5 tertulisnya|27.9 gak|28 ada|28.5 jadi|29 cerita|29.5 ini|29.7 lebih|29.9 ke|30 mitos|30.5 yang|30.7 enak|31 didengar"),
 dict(type="timeline", title="Fakta sejarah", entries=[{"year": "±820", "title": "Al-Khwarizmi (Persia)", "note": "buku Al-Jabr → asal kata “aljabar”"}],
      w="32 sejarah|32.5 aslinya|33 tuh|33.2 gini|33.8 sekitar|34.2 tahun|34.5 820|35.2 ilmuwan|35.8 persia|36 al-khwarizmi|36.8 nulis|37.3 buku|37.5 al-jabr|38 yang|38.2 jadi|38.5 asal|38.7 kata|39 aljabar"),
 dict(type="card", title="Masih pakai kata", heading="Al-Jabr, ±820", lines=["angka yang dicari", "disebut syai'", "(“sesuatu”)", "ditulis pakai kata,", "bukan simbol"], highlights=["syai'", "bukan simbol"],
      counter={"label": "Simbol", "value": "0"},
      w="39.5 di|39.7 situ|40 angka|40.3 yang|40.5 belum|41 diketahui|41.3 memang|41.4 disebut|41.5 syai|42 alias|42.5 sesuatu|42.7 tapi|43 ditulis|43.3 pakai|43.5 kata|44 bukan|44.5 simbol"),
 dict(type="timeline", title="Fakta sejarah", revealFrom=1,
      entries=[{"year": "±820", "title": "Al-Khwarizmi (Persia)", "note": "buku Al-Jabr → asal kata “aljabar”"},
               {"year": "1591", "title": "François Viète (Prancis)", "note": "vokal A E I = dicari · konsonan B C D = diketahui"}],
      w="44.8 terus|45.3 tahun|45.8 1591|46.6 matematikawan|47.3 prancis|47.7 françois|48.3 viète|48.7 mulai|49 pakai|49.5 huruf|49.7 huruf|50 vokal|50.3 buat|50.4 yang|50.5 dicari|51 huruf|51.3 konsonan|51.6 buat|51.8 yang|52 udah|52.5 diketahui"),
 dict(type="spotlight", title="Bintangnya: Descartes",
      w="53.5 nah|53.7 yang|54 bikin|54.2 x|54.5 jadi|54.8 bintang|55 itu|56 rené|56.5 descartes"),
 dict(type="board", title="La Géométrie, 1637",
      rows=[{"glyphs": ["a", "b", "c"], "label": "= diketahui"}, {"glyphs": ["x", "y", "z"], "label": "= dicari", "highlight": [0, 1, 2]}],
      w="57 di|57.2 bukunya|57.5 la|57.7 géométrie|58 tahun|58.5 1637|59.2 dia|60 pakai|60.5 huruf|60.7 awal|61 alfabet|61.3 a|61.5 b|61.6 c|61.8 buat|62 angka|62.3 yang|62.5 diketahui|63 dan|63.2 huruf|63.5 akhir|63.7 x|63.9 y|64.1 z|64.5 buat|64.7 yang|65 dicari"),
 dict(type="board", title="Jadi standar dunia", rows=[{"glyphs": ["x", "y", "z"], "struck": [1, 2], "highlight": [0]}], counter={"label": "Peringkat", "value": "#1"},
      w="65.5 dan|65.7 dari|66 tiga|66.2 huruf|66.5 itu|66.7 x|66.9 yang|67 paling|67.3 sering|67.6 dipakai|67.9 sampai|68.3 akhirnya|69 jadi|69.2 standar|69.5 dunia"),
 dict(type="board", title="Gosip: stok huruf x", stamp="BELUM TERBUKTI",
      rows=[{"glyphs": ["x"] * 6}, {"glyphs": ["x"] * 6}, {"glyphs": ["x"] * 6}],
      w="70.5 ada|70.6 juga|70.8 yang|71 bilang|71.4 tukang|71.7 cetaknya|72 kelebihan|72.5 stok|72.8 huruf|73 x|74 tapi|74.2 itu|74.5 juga|74.7 belum|75 ada|75.2 buktinya"),
 dict(type="card", title="Tradisi 400 tahun", heading="Soal Ujian", lines=["1.  2x + 3 = 11", "     x = ?", "2.  5x − 4 = 21", "     x = ?"], highlights=["x = ?"],
      counter={"label": "Tahun", "value": "±400"},
      w="76.5 jadi|77 setiap|77.3 kali|77.5 kalian|78 nyari|78.3 x|78.5 di|78.7 soal|79 ujian|79.5 kalian|79.7 sebenarnya|80 lagi|80.5 nerusin|81 tradisi|81.3 yang|81.5 umurnya|82 hampir|82.5 400|83 tahun|83.5 keren|84 banget|84.5 kan"),
 dict(type="cta", title="Komen: ganti x jadi?", commentWord="z aja!",
      w="85.5 tulis|85.7 di|85.9 komentar|86 huruf|86.5 apa|86.7 yang|87 menurut|87.3 kalian|87.5 lebih|88 cocok|88.2 buat|88.5 gantiin|89 x"),
]

caps = []
scenes = []
for sc in S:
    pairs = [p.split(" ", 1) for p in sc.pop("w").split("|")]
    words = [(float(t), w) for t, w in pairs]
    for t, w in words:
        caps.append({"word": w, "start": t, "end": t})
    sc["text"] = " ".join(w for _, w in words)
    scenes.append(sc)
for i, c in enumerate(caps):
    nxt = caps[i + 1]["start"] if i + 1 < len(caps) else c["start"] + 0.9
    c["end"] = round(min(nxt, c["start"] + 0.9), 2)

spec = {
    "fps": 30,
    "palette": "mono",
    "brand": {
        "cardTitle": "VERSI VIRAL",
        "cardBadge": "x",
        "cardName": "x berasal dari syai' |",
        "cardSubtitle": "katanya dari bahasa Arab",
        "cardSections": ["Bukti tertulis", "Sumber sejarah", "Catatan"],
        "cardButtons": ["Bagikan", "Simpan"],
    },
    "voiceover": "voiceover.m4a",
    "captions": caps,
    "scenes": scenes,
}
json.dump(spec, open(sys.argv[1], "w"), indent=2, ensure_ascii=False)
print(len(caps), "words,", len(scenes), "scenes, ends", caps[-1]["end"])
