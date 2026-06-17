import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/replicate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outfitDescription, outfitImageUrl, landmark, poseStyle } = body as {
      outfitDescription: string;
      outfitImageUrl?: string | null;
      landmark: { name: string; description: string };
      poseStyle: string;
    };

    if (!landmark) {
      return NextResponse.json({ error: 'landmark is required' }, { status: 400 });
    }

    const poseLabels: Record<string, string> = {
      NATURAL: '自然随性', FASHION: '时尚大片', ARTISTIC: '文艺清新',
      COOL: '酷帅有型', ELEGANT_POSE: '优雅气质', DYNAMIC: '动感活力',
    };

    const poseCN = poseLabels[poseStyle] || '自然';

    // 如果有穿搭效果图，以它为参考生成景点拍照
    const prompt = outfitImageUrl
      ? `图1中的同一个人，穿着同样的衣服，在${landmark.name}（${landmark.description}）拍摄旅行照片，${poseCN}姿势，全身照，保持人物面部和服装完全不变，只更换背景为${landmark.name}，专业旅行摄影`
      : `A fashion photo of a person at ${landmark.name}, ${landmark.description}, ${poseCN} pose, full body, travel photography`;

    // 4 种不同姿势描述
    const poseVariations: Record<string, string[]> = {
      NATURAL: ['自然站立，双手插兜，看向远方', '微微侧身，单手扶墙，自然微笑', '走路姿态抓拍，步伐轻盈', '坐在台阶上，放松随性'],
      FASHION: ['叉腰模特站姿，自信直视镜头', '侧身回眸，时尚大片感', '单手撩发，酷感十足', '倚靠栏杆，高级感pose'],
      ARTISTIC: ['侧脸仰望天空，文艺气息', '低头看书，安静优雅', '手捧花束，清新自然', '背对镜头走向远处，意境感'],
      COOL: ['街头滑板姿势，动感十足', '蹲姿酷帅，手指镜头', '跳跃瞬间，活力四射', '墨镜冷酷表情，背景虚化'],
      ELEGANT_POSE: ['微微侧身，双手自然下垂，端庄大方', '单手轻抚脖颈，优雅气质', '手提裙摆微微转动，灵动飘逸', '轻靠墙壁微笑，知性温柔'],
      DYNAMIC: ['跑步姿态，动感活力', '大步向前，风衣飘扬', '跳跃空中定格，青春洋溢', '旋转动作抓拍，灵动自然'],
    };

    const poses = poseVariations[poseStyle] || poseVariations.NATURAL;

    // 并行 4 次，每次不同姿势描述
    const tasks = poses.map((poseDesc, i) =>
      generateImage(
        outfitImageUrl
          ? `图1中的同一个人，穿着同样的衣服，${poseDesc}，在${landmark.name}（${landmark.description}）背景，保持人物面部和服装完全不变，全身照，旅行摄影`
          : `A fashion person ${poseDesc} at ${landmark.name}, ${landmark.description}, full body, travel photo`,
        undefined,
        outfitImageUrl ? [outfitImageUrl] : undefined
      ).then(url => url ? { pose: poseDesc, imageUrl: url } : null)
    );
    const results = await Promise.all(tasks);
    const images = results.filter(Boolean) as { pose: string; imageUrl: string }[];

    return NextResponse.json({ images, prompt, landmarkName: landmark.name });
  } catch (error) {
    console.error('POST /api/generate/pose error:', error);
    return NextResponse.json({ error: '姿势照片生成失败' }, { status: 500 });
  }
}
