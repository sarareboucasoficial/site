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
    return res.status(405).json({
      error: 'Método não permitido.'
    });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Credencial do Mercado Pago não configurada.'
    });
  }

  const paymentId =
    req.query.payment_id ||
    req.query.collection_id;

  if (!paymentId) {
    return res.status(400).json({
      error: 'ID do pagamento não informado.'
    });
  }

  try {
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago:', data);

      return res.status(mpResponse.status).json({
        error: 'Não foi possível verificar o pagamento.',
        detail: data.message || data.error || 'Erro do Mercado Pago.'
      });
    }

    const pagamentoMetanoia =
      data.metadata?.evento === 'imersao-metanoia-2026';

    const valorCorreto =
      Number(data.transaction_amount) === 47;

    return res.status(200).json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      aprovado:
        data.status === 'approved' &&
        pagamentoMetanoia &&
        valorCorreto,
      valor: data.transaction_amount,
      referencia: data.external_reference || null,
      evento: data.metadata?.evento || null
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Falha ao consultar o Mercado Pago.'
    });
  }
};