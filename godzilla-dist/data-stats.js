// ゴジラずかん v20 - 拡張データ
// 5軸ステータス(1-10): power=ちから / speed=はやさ / guard=タフさ / special=とくしゅ / size=おおきさ
// rarity: L=レジェンド / UR=ウルトラレア / SR=スーパーレア / R=レア
// title: カードに載る二つ名
const KAIJU_STATS = {
  // === ゴジラ (22) ===
  "showa-1954":          { title:"すべての はじまり",        rarity:"L",  power:8,  speed:4,  guard:8,  special:7,  size:5 },
  "showa-kingkong":      { title:"やまの けっとうしゃ",      rarity:"SR", power:8,  speed:5,  guard:8,  special:7,  size:5 },
  "showa-mothra":        { title:"あばれんぼうの おう",      rarity:"SR", power:8,  speed:5,  guard:8,  special:7,  size:5 },
  "showa-ghidorah":      { title:"3だいかいじゅう けっせん", rarity:"SR", power:8,  speed:5,  guard:8,  special:7,  size:5 },
  "showa-hedora":        { title:"そらを とんだ おう",       rarity:"SR", power:8,  speed:5,  guard:8,  special:7,  size:5 },
  "showa-mechagodzilla": { title:"しんゆうと ならぶ おう",   rarity:"SR", power:8,  speed:5,  guard:8,  special:8,  size:5 },
  "heisei-1984":         { title:"かえってきた おう",        rarity:"SR", power:8,  speed:4,  guard:8,  special:8,  size:7 },
  "heisei-biollante":    { title:"ばらとの けっせん",        rarity:"SR", power:9,  speed:4,  guard:8,  special:8,  size:7 },
  "heisei-ghidorah":     { title:"みらいを こえた おう",     rarity:"UR", power:9,  speed:4,  guard:9,  special:9,  size:8 },
  "heisei-mothra":       { title:"うみと そらの けっせん",   rarity:"SR", power:9,  speed:4,  guard:9,  special:8,  size:8 },
  "heisei-mechagodzilla":{ title:"Gフォースとの けっせん",   rarity:"SR", power:9,  speed:4,  guard:9,  special:9,  size:8 },
  "heisei-spacegodzilla":{ title:"うちゅうとの たたかい",    rarity:"SR", power:9,  speed:5,  guard:9,  special:9,  size:8 },
  "burning-godzilla":    { title:"もえつきる おう",          rarity:"L",  power:10, speed:5,  guard:9,  special:10, size:8 },
  "hollywood-1998":      { title:"はしる ゴジラ",            rarity:"R",  power:5,  speed:9,  guard:4,  special:4,  size:5 },
  "millennium-2000":     { title:"21せいきの おう",          rarity:"SR", power:8,  speed:6,  guard:7,  special:8,  size:5 },
  "final-wars":          { title:"さいきょうの おう",        rarity:"UR", power:10, speed:8,  guard:8,  special:9,  size:8 },
  "hollywood-2014":      { title:"しぜんの バランサー",      rarity:"UR", power:9,  speed:5,  guard:9,  special:8,  size:9 },
  "shin-godzilla":       { title:"しんかする きょうふ",      rarity:"L",  power:9,  speed:3,  guard:8,  special:10, size:9 },
  "godzilla-earth":      { title:"やまより おおきい おう",   rarity:"UR", power:10, speed:3,  guard:10, special:9,  size:10 },
  "king-of-monsters":    { title:"かいじゅうの おうさま",    rarity:"L",  power:10, speed:5,  guard:9,  special:10, size:9 },
  "godzilla-vs-kong":    { title:"しんかいの おう",          rarity:"UR", power:9,  speed:6,  guard:9,  special:9,  size:9 },
  "godzilla-minus-one":  { title:"ゼロから マイナスへ",      rarity:"L",  power:9,  speed:6,  guard:7,  special:9,  size:5 },

  // === かいじゅう (29) ===
  "mothra":        { title:"ひかりの まもりがみ",       rarity:"UR", power:6, speed:8,  guard:5, special:8, size:6 },
  "king-ghidorah": { title:"きんいろの はかいしん",     rarity:"L",  power:9, speed:7,  guard:8, special:9, size:8 },
  "mechagodzilla": { title:"はがねの ゴジラ",           rarity:"UR", power:8, speed:5,  guard:9, special:9, size:5 },
  "rodan":         { title:"そらの ちょうとっきゅう",   rarity:"SR", power:6, speed:10, guard:5, special:6, size:6 },
  "biollante":     { title:"ばらの かいじゅう",         rarity:"SR", power:8, speed:2,  guard:9, special:7, size:9 },
  "destoroyah":    { title:"しんくの あくま",           rarity:"UR", power:9, speed:6,  guard:8, special:9, size:9 },
  "space-godzilla":{ title:"うちゅうの コピー",         rarity:"UR", power:9, speed:6,  guard:9, special:9, size:9 },
  "anguirus":      { title:"とげとげの しんゆう",       rarity:"SR", power:6, speed:6,  guard:8, special:4, size:5 },
  "gigan":         { title:"うちゅうの しかく",         rarity:"SR", power:7, speed:8,  guard:6, special:7, size:6 },
  "hedorah":       { title:"こうがいの あくま",         rarity:"SR", power:7, speed:4,  guard:9, special:8, size:6 },
  "battra":        { title:"やみの まもりがみ",         rarity:"SR", power:7, speed:8,  guard:6, special:8, size:7 },
  "minilla":       { title:"おうさまの こども",         rarity:"SR", power:2, speed:3,  guard:3, special:3, size:2 },
  "kamacuras":     { title:"かまきりの ハンター",       rarity:"R",  power:4, speed:7,  guard:3, special:3, size:4 },
  "kumonga":       { title:"いとはき グモ",             rarity:"R",  power:4, speed:5,  guard:4, special:5, size:4 },
  "kingkong":      { title:"がいこつじまの おう",       rarity:"UR", power:7, speed:7,  guard:7, special:5, size:4 },
  "jet-jaguar":    { title:"せいぎの ロボット",         rarity:"SR", power:6, speed:7,  guard:6, special:6, size:4 },
  "ebirah":        { title:"うみの おおはさみ",         rarity:"R",  power:5, speed:5,  guard:5, special:3, size:4 },
  "megalon":       { title:"ドリルの こんちゅう",       rarity:"R",  power:6, speed:6,  guard:6, special:6, size:5 },
  "titanosaurus":  { title:"うみの きょうりゅう",       rarity:"R",  power:6, speed:5,  guard:6, special:5, size:5 },
  "manda":         { title:"うみの りゅうじん",         rarity:"SR", power:5, speed:7,  guard:5, special:5, size:8 },
  "gabara":        { title:"ゆめの いじめっこ",         rarity:"R",  power:3, speed:4,  guard:4, special:4, size:3 },
  "varan":         { title:"そらとぶ とかげ",           rarity:"R",  power:5, speed:7,  guard:5, special:4, size:4 },
  "megaguirus":    { title:"トンボの じょおう",         rarity:"R",  power:6, speed:9,  guard:4, special:6, size:3 },
  "frankenstein":  { title:"はしる きょじん",           rarity:"R",  power:5, speed:8,  guard:6, special:3, size:2 },
  "gorosaurus":    { title:"キックの めいじん",         rarity:"R",  power:5, speed:6,  guard:5, special:3, size:3 },
  "zilla":         { title:"スピードスター",            rarity:"R",  power:5, speed:9,  guard:4, special:4, size:5 },
  "orga":          { title:"コピーしっぱいの うちゅうじん", rarity:"R", power:7, speed:4, guard:8, special:7, size:6 },
  "meganulon":     { title:"むれで とぶ トンボ",        rarity:"R",  power:2, speed:6,  guard:2, special:2, size:1 },
  "muto":          { title:"でんきを くう もの",        rarity:"SR", power:7, speed:6,  guard:6, special:7, size:7 }
};

// レアリティ表示情報
const RARITY_INFO = {
  L:  { label: "レジェンド",   cls: "r-legend" },
  UR: { label: "ウルトラレア", cls: "r-ultra" },
  SR: { label: "スーパーレア", cls: "r-super" },
  R:  { label: "レア",         cls: "r-rare" }
};

// ガチャ排出率
const GACHA_WEIGHTS = { R: 52, SR: 32, UR: 12, L: 4 };

// ステータス軸の表示名
const STAT_AXES = [
  { key: "power",   label: "ちから" },
  { key: "speed",   label: "はやさ" },
  { key: "guard",   label: "タフさ" },
  { key: "special", label: "とくしゅ" },
  { key: "size",    label: "おおきさ" }
];

// KAIJU_DATA へマージ（読み込み順: data.js → data-stats.js）
(function() {
  KAIJU_DATA.forEach(k => {
    const s = KAIJU_STATS[k.id];
    if (s) Object.assign(k, s);
    else Object.assign(k, { title: "なぞの かいじゅう", rarity: "R", power:5, speed:5, guard:5, special:5, size:5 });
  });
})();

window.KAIJU_STATS = KAIJU_STATS;
window.RARITY_INFO = RARITY_INFO;
window.GACHA_WEIGHTS = GACHA_WEIGHTS;
window.STAT_AXES = STAT_AXES;
