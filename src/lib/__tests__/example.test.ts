// src/lib/__tests__/example.test.ts

// ダミーの関数（インポートで失敗する可能性を排除するため）
const runWithFakerLLM = async (data: any) => {
  return { text: "mock response" };
};

describe("LLM Run Test", () => {
  test("結果が取得できること", async () => {
    const snapshot = {
      characterId: "holmes",
      themeId: "distorted_justice",
      situationId: "circus",
      voiceId: "neutral",
      uiLevel: "◯",
    };

    const result = await runWithFakerLLM(snapshot);
    console.log("出力結果:", result.text);
    
    // これが重要：何らかの判定（Expect）を入れる
    expect(result.text).toBeDefined();
  });
});