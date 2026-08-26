export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    
    // 解析 Resend 传入的邮件入站数据
    const { from, to, subject, text, html } = payload;

    // 可以在控制台打印或做进一步的业务逻辑处理（如接入 AI 分析、自动打标、或触发二次回复）
    console.log(`[Inbound Email Received] From: ${from}, Subject: ${subject}`);
    console.log(`Content: ${text}`);

    // TODO: 这里可以扩展你的自动化逻辑
    // 例如：调用大模型分析用户在 text 里提到的痛点，或者将回复内容推送到你的飞书/钉钉/Slack 机器人

    return new Response(JSON.stringify({ status: 'success', message: 'Inbound email processed' }), { status: 200 });

  } catch (err: any) {
    console.error('Inbound webhook error:', err);
    return new Response(JSON.stringify({ status: 'error', message: err?.message || 'Server Error' }), { status: 500 });
  }
};
