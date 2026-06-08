import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';
import { buildPosePrompt } from '@/lib/ai';
import { generatePoseImages } from '@/lib/replicate';
import type { PoseStyle, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outfitDescription, cityName, landmark, poseStyle, userId } = body as {
      outfitDescription: string;
      cityName: string;
      landmark: { name: string; description: string };
      poseStyle: PoseStyle;
      userId?: string;
    };

    if (!outfitDescription || !landmark) {
      return NextResponse.json(
        { error: 'outfitDescription and landmark are required' },
        { status: 400 }
      );
    }

    // 获取用户数据（如果有 userId）
    let user: User | null = null;
    if (userId) {
      const dbUser = await getUserById(userId);
      user = dbUser as unknown as User | null;
    }

    // Build prompt for Stable Diffusion (with user body data)
    const prompt = buildPosePrompt(
      outfitDescription,
      landmark.name,
      landmark.description,
      poseStyle,
      user
    );

    // Generate 4 pose images
    let imageUrls: string[] = [];
    try {
      imageUrls = await generatePoseImages(prompt, 4);
    } catch {
      console.log('Pose image generation failed');
    }

    const poseStyleLabels: Record<string, string> = {
      NATURAL: '自然随性',
      FASHION: '时尚大片',
      ARTISTIC: '文艺清新',
      COOL: '酷帅有型',
      ELEGANT_POSE: '优雅气质',
      DYNAMIC: '动感活力',
    };

    const images = imageUrls.map((url, i) => ({
      pose: `${poseStyleLabels[poseStyle] || '自然'}姿势${i + 1}`,
      imageUrl: url,
    }));

    return NextResponse.json({
      images,
      prompt,
      cityName,
      landmarkName: landmark.name,
    });
  } catch (error) {
    console.error('POST /api/generate/pose error:', error);
    return NextResponse.json(
      { error: '姿势照片生成失败，请重试' },
      { status: 500 }
    );
  }
}
