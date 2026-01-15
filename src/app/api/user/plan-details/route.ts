import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.log("SESSION",session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plan = user.plan;
    
    // Default fallback if no plan is assigned
    if (!plan) {
      return NextResponse.json({
        success: true,
        planName: "Free",
        limitations: {
          pfp_edit: false,
          name_edit: false,
          can_send_gifs: false,
          can_send_videos: false,
          can_send_emojis: false,
          chat_cooldown: 30,
          chats_left: Math.max(0, 20 - user.chatCount),
          chat_timer: 30,
          max_friend_req: 0,
          min_match_time: 90
        }
      });
    }

    return NextResponse.json({
      success: true,
      planName: plan.name,
      limitations: {
        pfp_edit: plan.editPfp,
        name_edit: plan.editName,
        can_send_gifs: plan.sendGifs,
        can_send_videos: plan.sendVideos,
        can_send_emojis: plan.sendEmojis,
        chat_cooldown: plan.chatTimer,
        chats_left: Math.max(0, plan.maxDailyChats - user.chatCount),
        chat_timer: plan.chatTimer,
        max_friend_req: plan.maxFriendReq,
        min_match_time: plan.minMatchTime,
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}