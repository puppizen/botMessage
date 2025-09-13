// app/api/bots

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';

const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.BOT_TOKEN;

export async function POST(req: NextRequest) {
  const update = await req.json();

  // Check if it's a /start command
  const userId = update?.message?.from?.id;
  const username = update?.message?.from?.username ?? 'Anonymous';
  const messageText = update?.message?.text;
  const chatId = update?.message?.chat?.id;
  // const payment = update?.message?.successful_payment;

  if (!userId || !chatId) {
    return new Response('Invalid Telegram user', { status: 400 });
  }

  // for /start command
  if (messageText === '/start' && chatId) {
    await User.updateOne(
      { userId },
      {
        $set: {
          userId,
          chatId,
          username,
        },
      },
      { upsert: true }
    );

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
