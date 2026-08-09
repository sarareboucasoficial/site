module.exports = async function handler(req, res) {
  const allowedOrigins = new Set([
    'https://sarareboucas.com.br',
    'https://www.sarareboucas.com.br'
  ]);
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Credencial do Mercado Pago não configurada.' });
  }

  const paymentId = req.query.payment_id || req.query.collection_id;
  if (!paymentId || !/^\d+$/.test(String(paymentId))) {
    return res.status(400).json({ error: 'Pagamento não identificado.' });
  }

  try {
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({ error: 'Não foi possível verificar o pagamento.' });
    }

    const valor = Number(data.transaction_amount || 0);
    const opcao = valor === 73 ? '73' : valor === 47 ? '47' : null;

    return res.status(200).json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      amount: valor,
      opcao,
      external_reference: data.external_reference || null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Falha ao consultar o pagamento.' });
  }
};
