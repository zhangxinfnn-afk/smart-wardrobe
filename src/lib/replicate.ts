import Replicate from 'replicate';

let replicate: Replicate | null = null;

function getReplicate() {
  if (!replicate) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (token && token !== 'your_replicate_token') {
      replicate = new Replicate({ auth: token });
    }
  }
  return replicate;
}

export async function generateImage(prompt: string, negativePrompt?: string): Promise<string | null> {
  const client = getReplicate();
  if (!client) {
    console.log('[Replicate] No API token configured, returning mock image');
    return null;
  }

  try {
    const output = await client.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt || 'blurry, low quality, distorted face, bad anatomy, watermark',
          num_outputs: 1,
          width: 768,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    // output is string[] of URLs
    if (Array.isArray(output) && output.length > 0) {
      return output[0];
    }
    return null;
  } catch (error) {
    console.error('[Replicate] Generation failed:', error);
    return null;
  }
}

export async function generatePoseImages(
  prompt: string,
  count: number = 4
): Promise<string[]> {
  const client = getReplicate();
  if (!client) {
    console.log('[Replicate] No API token configured, returning mock');
    return [];
  }

  try {
    const output = await client.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt,
          negative_prompt: 'blurry, low quality, distorted face, bad anatomy, watermark, duplicate',
          num_outputs: count,
          width: 768,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    if (Array.isArray(output)) {
      return output.filter((url): url is string => typeof url === 'string');
    }
    return [];
  } catch (error) {
    console.error('[Replicate] Pose generation failed:', error);
    return [];
  }
}
