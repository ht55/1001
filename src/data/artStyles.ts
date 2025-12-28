// pages/types/artStyles.ts

export type ArtStyle = {
  id: string;
  name: string;
  description: string;
  keywords: string[];   // プロンプト生成時に結合する
};

export const artStyles: ArtStyle[] = [
  {
    id: "beardsley_like",
    name: "白黒装飾的アールヌーボー風",
    description: "黒インクの強いコントラストと曲線的な装飾を特徴とする白黒のアールヌーボー調スタイル。",
    keywords: [
      "black and white ink illustration",
      "high contrast",
      "ornamental lines",
      "art nouveau curves",
      "decorative composition"
    ],
  },
  {
    id: "varo_like",
    name: "神秘的・幻想科学的絵画風",
    description: "超現実的で神秘的な雰囲気、精密な描写、幻想科学のような機械・建築を含む幻想絵画スタイル。",
    keywords: [
      "surreal mystical painting",
      "precise detailing",
      "dreamlike atmosphere",
      "fantastical machinery",
      "symbolic narrative"
    ],
  },
  {
    id: "tenniel_like",
    name: "精密線画のヴィクトリア朝風",
    description: "細密な線画とクラシックな構図を持つヴィクトリア朝挿絵スタイル。",
    keywords: [
      "victorian illustration",
      "precise line drawing",
      "classic cross-hatching",
      "formal composition",
      "engraving style"
    ],
  },
  {
    id: "escher_like",
    name: "幾何学・錯視アート風",
    description: "幾何学模様、トポロジー、不可能図形など視覚トリックに基づく錯視アートスタイル。",
    keywords: [
      "geometric patterns",
      "optical illusion",
      "impossible shapes",
      "mathematical symmetry",
      "monochrome precision"
    ],
  },
  {
    id: "bosch_like",
    name: "幻想的で群像的・寓意的絵画風",
    description: "寓意や象徴を含む細密群像、奇怪な生物や幻想風景が特徴の寓意的ファンタジースタイル。",
    keywords: [
      "allegorical fantasy",
      "dense crowd scenes",
      "bizarre hybrid creatures",
      "symbolic narrative",
      "detailed medieval atmosphere"
    ],
  },
  {
    id: "takidaira_like",
    name: "黒白木版画風の素朴な民話調",
    description: "厚い黒ベタと大胆な形状、静かな情感を持つ木版画スタイル。",
    keywords: [
      "woodcut style",
      "black and white blocks",
      "bold shapes",
      "folk tale atmosphere",
      "quiet emotional tone"
    ],
  },
  {
    id: "dix_like",
    name: "写実的で鋭い陰影の表現主義風",
    description: "鋭い陰影、強い現実感、社会的テーマを含む表現主義寄りの写実スタイル。",
    keywords: [
      "sharp realism",
      "expressive shadows",
      "harsh atmosphere",
      "high detail portraiture",
      "social commentary mood"
    ],
  },
  {
    id: "maruo_like",
    name: "強コントラストの耽美的・劇画調",
    description: "高コントラスト、劇画的構図、耽美で退廃的な雰囲気を持つスタイル。",
    keywords: [
      "dramatic contrast",
      "gothic elegance",
      "graphic novel style",
      "decadent tone",
      "bold line work"
    ],
  },
  {
    id: "maya_like",
    name: "優雅で曲線的なポップ耽美表現",
    description: "優雅な曲線、美しいキャラクター造形、軽快なポップ調を備えた耽美スタイル。",
    keywords: [
      "elegant curves",
      "stylized beauty",
      "pop aesthetic",
      "clean line art",
      "graceful composition"
    ],
  },
  {
    id: "kaneko_like",
    name: "艶やかな幻想・演劇的耽美スタイル",
    description: "艶やかな色調、演劇的なポーズ、幻想的で妖しい雰囲気を持つスタイル。",
    keywords: [
      "dramatic poses",
      "lustrous colors",
      "fantastical elegance",
      "ornate detail",
      "mysterious mood"
    ],
  },

  //
  // ---- 大ジャンル ----
  //

  {
    id: "marionette",
    name: "マリオネット劇風",
    description: "糸で繋がれた人形のような表情と舞台セットを模した構図。",
    keywords: [
      "marionette puppet",
      "stage set scenery",
      "jointed wooden limbs",
      "dramatic lighting",
      "theatrical atmosphere"
    ],
  },
  {
    id: "stained_glass",
    name: "ステンドグラス風",
    description: "輪郭線で区切られた彩色ガラスのような輝きと幾何学配置。",
    keywords: [
      "stained glass texture",
      "bold outlines",
      "glowing translucent colors",
      "geometric segmentation",
      "illuminated patterns"
    ],
  },
  {
    id: "ukiyoe",
    name: "浮世絵風",
    description: "平面的構図、淡い色彩、デフォルメとパターンが特徴の日本木版画スタイル。",
    keywords: [
      "japanese woodblock print",
      "flat perspective",
      "delicate colors",
      "traditional patterns",
      "flowing line work"
    ],
  },
];
