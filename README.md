<p align="center">
  <img src="app.png" width="420" alt="App Screenshot" />
</p>

# 1001: Short Story Distorting Generator 
Experimental Faker x LLM story distorting generator in Japanese.
PythonライブラリのFaker x LLMによる、日本語の実験的超短編歪曲生成装置。日本語での説明はこのページの最後にあります。

You can play with the generator here. こちらから実際に遊べます:  
👉 https://1001generator.vercel.app

## About This Project

This project is an experimental narrative generation system that explores how stories can emerge from **constrained chains of transformation**, rather than from free-form text generation.

By combining the structured randomness of the Python library **Faker** with the contextual sensitivity (and occasional fun instability) of large language models (LLMs), this system functions as a *device* that generates stories as a byproduct of internal state transitions.

---

## Concept

In this project, a story is treated not as a sequence of sentences, but as the result of changing internal states such as **meaning**, **tension**, **distortion**, and **absence**, operating under specific world conditions.

The system assumes that narrative emergence occurs when abstract reaction states are transformed by constraints and situations.

To formalize this idea, the narrative structure is modeled as a two-phase sequential reaction:

### Phase 1 — Reaction Formation

**f : C × T → R**

where:
- `C` = set of characters  
- `T` = set of themes  
- `R` = reaction profile  

The function `f` is a piecewise stochastic process:

f(c, t) = sample(R | rules(c, t), bias(c), ui(c, t))

This phase determines how a character reacts to a theme under specific biases and constraints.

---

### Phase 2 — Reaction Transformation

**g : R × S → R'**

where:
- `S` = set of situations  
- `R'` = transformed reaction state  

This allows compositional chaining:

(g ∘ f)(c, t, s)


Through this process, narrative structure is established *before* any text is generated.

---

## Role of Faker and LLM

### Faker as Structural Generator

Python’s **Faker** library is used not merely as a random content generator, but as a **material source combined with editorial logic**.

It is responsible for:
- Fixing the base narrative structure (*SourceStory*)
- Applying user-selected constraints
- Introducing distortions via world modifiers

This stage defines *what the story is allowed to be*.

---

### LLM as Renderer, Not Author

The LLM is intentionally positioned as a **renderer**, not a decision-maker.

Its role is limited to:
- Translating an already-fixed structure into language
- Handling expression, tone, and description

By denying the LLM control over narrative meaning and structure, the system preserves a slight darkness and instability—leaving room for the AI to “play” within strict boundaries.

The resulting stories often resemble short, distorted narrative fragments, somewhat reminiscent of experimental short fiction rather than polished prose.

---

## Experimental Nature

Because this project prioritizes **process over outcome**, the generated stories may occasionally feel unnatural, unstable, or incomplete.

This is intentional.

The system is designed as an exploratory device—a mechanism for observing how narrative meaning arises from constrained transformations, rather than a tool for producing perfect stories.

---

## Disclaimer

This project is experimental in nature and should be approached as a conceptual and artistic exploration rather than a conventional story generator.



## License

This project is released under a **Custom Non-Commercial License**.

### ✅ Allowed
- Learning and studying the code
- Personal or educational use
- Non-commercial experimentation
- Creating derivative works with attribution

### ❌ Not Allowed
- Commercial use
- Selling or redistributing this project as a product
- Using this project in paid services or monetized platforms
- Repackaging this project for resale

If you wish to use this project commercially or beyond the scope of this
license, please contact the author for permission.

---

## In Japanese
このプロジェクトでは、PythonライブラリのFakerと、文脈理解力の高さと若干の暴走性を持つLLMを合体させ、制約された変換の連鎖によって物語が立ち上がる過程を生成する装置を作成した。この装置では、キャラクター、テーマ、シチュエーション、ナラティブボイス(語り口)を入力すると、内部でいくつかの抽象的な状態遷移が起こり、その結果として物語が出現する。このプロジェクトにおいて重要なのは、テキスト生成は最終段階であり、主役ではないという点である。

まず物語とは「意味」「緊張」「歪み」「欠落」などの状態が、ある世界条件のもとで変化した結果であると仮定し、 抽象的な反応状態(Reaction Profile)を世界条件(Situation / WorldModifier)に通した構造を、英語で前述したように数学的に二段階の反応(Sequential Reaction)と定義した。

その上で、Python Fakerの持つランダム生成要素を最大化し、素材ライブラリx編集ロジックとしての役割を担わせ、物語構造(Source Story)、制約(ユーザーの選択する項目)、そして歪み(World Modifier)を確定させた。次にLLMを、既に確定した構造を翻訳するレンダラーとして扱い、表現・描写部分だけを担当させることで、あえて少しダーク＆不安定で、AIが「遊び始める余地」を残した物語の生成を目指した(ミヒャエル・エンデや稲垣足穂的なショートショート構造のようなものが理想系)。あくまでも結果より工程を重視した実験的要素の強い装置であるため、生成後の物語に若干の不自然さが感じられる場合もある。











