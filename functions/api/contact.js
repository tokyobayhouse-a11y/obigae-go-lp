// 帯替えGO!! お問い合わせフォーム
// Cloudflare Pages Functions: POST /api/contact
//
// Required env vars (set in Cloudflare Pages dashboard):
//   RESEND_API_KEY    ─ Resend APIキー (見積りGO と同じものを流用)
//   CONTACT_TO_EMAIL  ─ 通知先メール (例: tokyo.bayhouse@gmail.com)
//   CONTACT_FROM      ─ (任意) 送信元アドレス。デフォルト: "帯替えGO 運営事務局 <noreply@mitsumori-go.com>"
//                       ※ Resend に検証済みドメインのアドレスを指定する必要あり。
//                          obigae-go.com を Resend に追加するまでは mitsumori-go.com を借りる。

const CORS_ALLOWED_ORIGINS = [
  'https://obigae-go.com',
  'https://www.obigae-go.com',
  'https://obigae-go.pages.dev',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = CORS_ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function json(status, data, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') {
    return json(405, { error: { message: 'method not allowed' } }, cors);
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: { message: 'JSONが不正です' } }, cors);
  }

  // Honeypot — bots fill the hidden "website" field; humans don't.
  if (body.website) {
    // Pretend success to not tip off the bot
    return json(200, { ok: true }, cors);
  }

  // Validate
  const name = String(body.name || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().slice(0, 200);
  const company = String(body.company || '').trim().slice(0, 200);
  const type = String(body.type || '').trim().slice(0, 80);
  const message = String(body.message || '').trim().slice(0, 5000);
  const source = String(body.source || 'lp').trim().slice(0, 40);

  if (!email || !email.includes('@') || email.length < 5) {
    return json(400, { error: { message: 'メールアドレスをご確認ください' } }, cors);
  }
  if (!message || message.length < 5) {
    return json(400, { error: { message: 'お問い合わせ内容を5文字以上ご入力ください' } }, cors);
  }

  if (!env.RESEND_API_KEY) {
    return json(500, {
      error: { message: 'メール送信設定が未構成です。直接 info@obigae-go.com までお願いします。' },
    }, cors);
  }

  const to = env.CONTACT_TO_EMAIL || 'tokyo.bayhouse@gmail.com';
  const from = env.CONTACT_FROM || '帯替えGO 運営事務局 <noreply@mitsumori-go.com>';
  const subject = `【帯替えGO‼︎ お問い合わせ】${type || 'その他'}${name ? ' / ' + name : ''}`;

  const textBody = [
    `■ 送信元: ${source}`,
    `■ 氏名: ${name || '(未入力)'}`,
    `■ メール: ${email}`,
    `■ 会社名: ${company || '(未入力)'}`,
    `■ お問い合わせ種別: ${type || '(未選択)'}`,
    '',
    '■ 内容:',
    message,
    '',
    '---',
    '帯替えGO‼︎ お問い合わせフォーム (https://obigae-go.com/)',
  ].join('\n');

  const htmlBody = `
<div style="font-family:-apple-system,'Hiragino Kaku Gothic ProN',sans-serif;color:#111;line-height:1.7;max-width:600px">
  <h2 style="color:#0d4d6b;border-bottom:2px solid #d97706;padding-bottom:8px">帯替えGO‼︎ お問い合わせ</h2>
  <table style="border-collapse:collapse;width:100%;margin:14px 0">
    <tr><td style="padding:8px;background:#e8f1f5;font-weight:700;width:35%">送信元</td><td style="padding:8px">${escapeHtml(source)}</td></tr>
    <tr><td style="padding:8px;background:#e8f1f5;font-weight:700">氏名</td><td style="padding:8px">${escapeHtml(name || '(未入力)')}</td></tr>
    <tr><td style="padding:8px;background:#e8f1f5;font-weight:700">メール</td><td style="padding:8px"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding:8px;background:#e8f1f5;font-weight:700">会社名</td><td style="padding:8px">${escapeHtml(company || '(未入力)')}</td></tr>
    <tr><td style="padding:8px;background:#e8f1f5;font-weight:700">種別</td><td style="padding:8px">${escapeHtml(type || '(未選択)')}</td></tr>
  </table>
  <h3 style="color:#0d4d6b;margin-top:20px">お問い合わせ内容</h3>
  <div style="background:#f9fafb;border-left:4px solid #d97706;padding:14px;white-space:pre-wrap;border-radius:4px">${escapeHtml(message)}</div>
  <p style="color:#6b7280;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">
    帯替えGO‼︎ お問い合わせフォーム<br>
    <a href="https://obigae-go.com/" style="color:#0d4d6b">https://obigae-go.com/</a>
  </p>
</div>
  `.trim();

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error('Resend error:', resp.status, err);
      return json(502, {
        error: { message: '送信に失敗しました。お手数ですがメールで直接ご連絡ください。' },
      }, cors);
    }
    return json(200, { ok: true }, cors);
  } catch (err) {
    console.error('fetch error:', err);
    return json(500, {
      error: { message: 'ネットワークエラー: ' + (err.message || String(err)) },
    }, cors);
  }
}
