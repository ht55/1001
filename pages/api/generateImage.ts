// pages/api/generateImage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI クライアント
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST 以外は禁止
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { scene, styleId } = req.body;

  if (!scene || !styleId) {
    return res.status(400).json({ error: "Missing scene or styleId" });
  }

  try {
    // -------------------------
    // 画像生成
    // -------------------------
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: `Scene: ${scene}\nStyle ID: ${styleId}`,
      size: "1024x1024",
    });

    // Base64 画像取得
    const imageBase64 = response.data[0].b64_json;

    return res.status(200).json({
      success: true,
      image: imageBase64,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: "Image generation failed",
      detail: error?.message,
    });
  }
}
