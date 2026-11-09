export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('not found', { status: 404 });
    if (!env.RELAY_KEY || request.headers.get('Authorization') !== `Bearer ${env.RELAY_KEY}`) {
      return new Response('forbidden', { status: 403 });
    }

    let text = '';
    try {
      ({ text } = await request.json());
    } catch {
      return new Response('bad request', { status: 400 });
    }
    text = String(text || '').slice(0, 4000);
    if (!text) return new Response('empty', { status: 400 });

    const response = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text, disable_web_page_preview: true }),
    });
    return new Response(await response.text(), { status: response.status });
  },
};
