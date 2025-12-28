export const SCENE_MODIFIER_OVERLAY: Record<
  string,
  Partial<Record<string, string>>
> = {
  room_all_to_oneself: {
    fixation: "同じ思考が、部屋の中で反響し続けている。",
    voidification: "部屋は広いのに、意味だけが欠けている。",
    emergent_possibility: "小さな違和感が、出口の方向を示している。"
  },

  infinite_labyrinth: {
    distortion: "通路は、意思を持つかのように形を変え続けている。",
    observer_bias: "見る角度によって、迷宮は別の構造を見せる。",
    emergent_possibility: "遠くに、出口のようなものが見える。"
  },

  neon_district: {
    inversion: "光は華やかだが、影の方が真実を語っている。",
    distortion: "色彩が、現実の輪郭を曖昧にしている。"
  }
}
