# engine/generate_story.py

from faker import Faker
import random

fake = Faker("ja_JP")

def osaka_auntie_story():
    opening = [
        "あんたな、人生ってそんな思い通りいかへんねん。",
        "まあ聞きや。うちが昔聞いた話やけどな。",
        "運命？そらあるんかもしれんけどな、"
    ]

    middle = [
        f"{fake.first_name()}いう人がおってな、",
        "ある日、えらい不思議な場所に迷い込んでしもてん。",
        "戻れるかどうかも分からん境目みたいなとこでな、"
    ]

    conflict = [
        "そこで選ばなあかんかったんよ。",
        "進むか、戻るか。",
        "誰かの言葉を信じるか、自分を信じるか。",
    ]

    ending = [
        "結局どっち選んだかはな、本人にしか分からへん。",
        "でもな、選んだ以上はしゃあない。",
        "人生って、だいたいそんなもんやで。"
    ]

    story = " ".join([
        random.choice(opening),
        random.choice(middle),
        random.choice(conflict),
        random.choice(ending),
    ])

    return story


if __name__ == "__main__":
    print(osaka_auntie_story())
