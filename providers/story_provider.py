from faker import Faker
from faker.providers import BaseProvider
import random

faker = Faker("ja_JP")


class StoryProvider(BaseProvider):
    # --- シチュエーション ---
    situations = {
        "tropical_beach": "異国のビーチ",
        "savanna": "遥かなるサバンナ",
        "circus_tent": "辺境のサーカステント",
        "deep_forest": "深い森の奥",
        "space_station": "銀河の観測基地",
    }

    # --- モチーフ ---
    motifs = {
        "arroganceFall": "不遜によって没落",
        "curiosityPrice": "禁断の知識を追い求めた",
        "jealousyRuin": "嫉妬に支配された",
        "awakening": "目覚めの時を迎えた",
        "collapseOfUtopia": "理想郷の崩壊を目撃した",
    }

    # --- 文調 ---
    voices = {
        "neutral": "淡々とした語り口で物語は進んでいく。",
        "cold": "冷ややかな視点が、運命の残酷さを浮き彫りにする。",
        "heroic": "英雄譚のような調子で出来事が語られる。",
        "poetic": "詩的な比喩が、情景と感情を包み込む。",
        "osakaObahan": "妙に馴れ馴れしく、核心を突く語り口や。",
    }


faker.add_provider(StoryProvider)


# =========================
# 本番用ストーリー生成API
# =========================

def generate_story(payload: dict, engine: str = "faker"):
    """
    payload 例:
    {
      "motif": "awakening",
      "situation": "deep_forest",
      "voice": "poetic"
    }
    """

    if engine == "faker":
        return _generate_with_faker(payload)

    elif engine == "llm":
        raise NotImplementedError("LLM engine is not implemented yet")

    else:
        raise ValueError("Unknown story engine")


def _generate_with_faker(payload: dict):
    motif_key = payload.get("motif")
    situation_key = payload.get("situation")
    voice_key = payload.get("voice")

    motif = faker.motifs.get(motif_key, "名もなき存在")
    situation = faker.situations.get(situation_key, "どこでもない場所")
    voice = faker.voices.get(voice_key, "")

    title = f"{situation}にて ― {motif}"

    sections = [
        {
            "type": "ki",
            "text": f"{situation}で、{motif}は静かに物語の始まりを迎える。{voice}"
        },
        {
            "type": "sho",
            "text": f"{motif}は周囲の変化に気づき、避けられぬ運命の兆しを感じ取る。"
        },
        {
            "type": "ten",
            "text": f"ある出来事がすべてを覆し、{motif}の信じていた世界は崩れ去る。"
        },
        {
            "type": "ketsu",
            "text": f"やがて{motif}は選択の果てに、新たな意味を胸に刻むことになる。"
        },
    ]

    return {
        "title": title,
        "sections": sections
    }

