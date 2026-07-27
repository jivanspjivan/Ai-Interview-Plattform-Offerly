import { NextResponse } from "next/server";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
]);

type OpenAITranscriptionResponse = {
  text?: string;
  error?: {
    message?: string;
  };
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Transcription is not configured on this server." },
      { status: 503 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "The request must contain an audio file." },
      { status: 400 },
    );
  }

  const audio = formData.get("audio");

  if (!(audio instanceof File)) {
    return NextResponse.json(
      { error: "Select or record an audio answer first." },
      { status: 400 },
    );
  }

  if (audio.size === 0 || audio.size > MAX_AUDIO_SIZE) {
    return NextResponse.json(
      { error: "Audio must be larger than 0 bytes and no more than 25 MB." },
      { status: 413 },
    );
  }

  const normalizedType = audio.type.split(";")[0];
  if (normalizedType && !SUPPORTED_AUDIO_TYPES.has(normalizedType)) {
    return NextResponse.json(
      { error: "Unsupported audio format." },
      { status: 415 },
    );
  }

  const openAIFormData = new FormData();
  openAIFormData.append("file", audio, audio.name || "answer.webm");
  openAIFormData.append("model", "gpt-4o-mini-transcribe");
  openAIFormData.append("response_format", "json");

  try {
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: openAIFormData,
      },
    );
    const result = (await response.json()) as OpenAITranscriptionResponse;

    if (!response.ok) {
      console.error("OpenAI transcription failed", response.status);
      return NextResponse.json(
        {
          error:
            result.error?.message ??
            "The transcription service could not process this audio.",
        },
        { status: response.status >= 500 ? 502 : 400 },
      );
    }

    const transcript = result.text?.trim();
    if (!transcript) {
      return NextResponse.json(
        { error: "No speech could be detected in this recording." },
        { status: 422 },
      );
    }

    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json(
      { error: "The transcription service is currently unavailable." },
      { status: 502 },
    );
  }
}
