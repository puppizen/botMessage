// app/api/bots

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import connectDb from '@/lib/mongodb';

const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.BOT_TOKEN;

// Generate referral code
const generateRefCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
  let userRefCode = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    userRefCode += chars [randomIndex]
  }
  return userRefCode
};

export async function POST(req: NextRequest) {
  await connectDb();
  const update = await req.json();

  // Check if it's a /start command
  const userId = update?.message?.from?.id;
  const username = update?.message?.from?.username ?? 'Anonymous';
  const messageText = update?.message?.text;
  const chatId = update?.message?.chat?.id;
  const isBot = Boolean(update?.message.is_bot);
  // const payment = update?.message?.successful_payment;

  console.log('Incoming request...');
  console.log('userId:', userId);
  console.log('username:', username);

  if (!userId || !chatId) {
    return new Response('Invalid Telegram user', { status: 400 });
  }

  if (isBot) {
    return NextResponse.json({ error: 'Bots are not allowed' }, { status: 400 });
  } 

  let user = await User.findOne({ userId });

  // for /start command
  if (messageText === '/start' && chatId) {
    if (!user) {
      let refCode = '';
      let isUnique = false;

      while (!isUnique) {
        refCode = generateRefCode();
        const existingUser = await User.findOne({ refCode });
        if (!existingUser) isUnique = true
      }

      user = await User.create({
        userId,
        username,
        isBot,
        chatId: chatId,
        balance: 10,
        referrals: 0,
        referredUsers: [],
        taskCompleted: 0,
        completedTasks: [],
        verifiedTasks: [],
        claimedTasks: [],
        startedTasks: [],
        refCode,
      });
    }

    const replyText = 
    `🐶 Ready to earn like a good pup?\n\n` +
    `Play Puppizen and earn real rewards 💎\n\n` +
    `💎 Complete Tasks – Quick, simple, and rewarding\n` +
    `💎 Invite Friends – Grow your crew and earn more\n` +
    `💎 Collect Rewards – Treat yourself like a good pup\n\n` +
    `Start wagging your way to the top! 🐾`;

    await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: "https://puppizen.github.io/puppizen/banner.png",
        caption: replyText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Earn Puppizen',
                url: 'https://t.me/PuppizenBot/earn'
              }
            ],
            [
              {
                text: 'Telegram Community',
                url: 'https://t.me/puppizen'
              }
            ],
            [
              {
                text: 'X Community',
                url: 'https://x.com/puppizen'
              }
            ]
          ]
        }
      }),
    });
  }

  // successfull payment
  // if (payment) {
  //   console.log('Payment received:', {
  //     userId,
  //     amount: payment.total_amount,
  //     payload: payment.invoice_payload,
  //     chargeId: payment.telegram_payment_charge_id
  //   });

  //   const payload = payment?.invoice_payload;

  //   if (payload === `Daily reward for - ${userId}`) {

  //     const timeStamp = update.message.date;
  //     const paymentDate = new Date(timeStamp * 1000).toDateString();
  //     const total_amount = payment.total_amount / 100
  //     // Update user reward status in DB
  //     await User.updateOne(
  //       { userId },
  //       {
  //         $set: {
  //           lastStarsPaidAt: paymentDate,
  //           starsPaidToday: total_amount,
  //         }
  //       },
  //       { upsert: true }
  //     );

  //     // Send confirmation message
  //     await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         chat_id: chatId,
  //         text: `🎉 You've successfully sent ${total_amount} stars, claim your daily rewards!`,
  //         reply_markup: {
  //           inline_keyboard: [
  //             [
  //               {
  //                 text: 'Claim reward',
  //                 url: 'https://t.me/PuppizenBot/earn'
  //               }
  //             ],
  //           ]
  //         }
  //       }),
  //     });
  //   }
  // }
  
  return NextResponse.json('OK', { status: 200 });
}
