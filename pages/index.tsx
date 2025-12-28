import { useState } from "react";
import { useRouter } from "next/router";

import { japaneseCharacters } from "@/data/characters/japaneseCharacters";
import { englishCharacters } from "@/data/characters/englishCharacters";
import type { Character } from "@/types/character";

export default function Home() {
  const router = useRouter();

  // 言語状態（完成形）
  const [lang, setLang] = useState<"ja" | "en">("ja");

  // 表示するキャラ（完成形）
  const characters: Character[] =
    lang === "ja" ? japaneseCharacters : englishCharacters;

  const handleSelect = (character: Character) => {
    router.push({
      pathname: "/story",
      query: { characterId: character.id },
    });
  };

  return (
    <main style={{ padding: "32px" }}>
      <h1>キャラクター選択</h1>

      {/* 言語切替 UI（完成形） */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => setLang("ja")}
          disabled={lang === "ja"}
        >
          日本語
        </button>
        <button
          onClick={() => setLang("en")}
          disabled={lang === "en"}
          style={{ marginLeft: "8px" }}
        >
          English
        </button>
      </div>

      {/* キャラ一覧（Name / Description / Image のみ） */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => handleSelect(character)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "12px",
              padding: 0,
              background: "white",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <img
              src={character.image}
              alt={character.name}
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "12px" }}>
              <h3>{character.name}</h3>
              <p>{character.description}</p>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
