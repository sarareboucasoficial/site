const crypto = require('crypto');

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
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

  const baseUrl = 'https://sarareboucas.com.br';

  const referencia =
    `metanoia-47-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const preference = {
    items: [
      {
        id: 'imersao-metanoia-2026',
        title: 'Imersão Metanoia — Chamados para Cuidar',
        description: 'Inscrição online para a Imersão Metanoia — 7, 8 e 9 de setembro de 2026',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 47
      }
    ],

    external_reference: referencia,

    back_urls: {
      success:
        `${baseUrl}/concluir-inscricao-imersao.html?resultado=sucesso`,

      pending:
        `${baseUrl}/concluir-inscricao-imersao.html?resultado=pendente`,

      failure:
        `${baseUrl}/concluir-inscricao-imersao.html?resultado=erro`
    },

    auto_return: 'approved',

    statement_descriptor: 'METANOIA',

    metadata: {
      evento: 'imersao-metanoia-2026',
      valor: '47'
    }
  };

  try {
    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID()
        },

        body: JSON.stringify(preference)
      }
    );

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago:', data);

      return res.status(mpResponse.status).json({
        error: 'Não foi possível iniciar o pagamento.',
        detail: data.message || data.error || 'Erro do Mercado Pago.'
      });
    }

    return res.status(200).json({
      preference_id: data.id,
      checkout_url: data.init_point
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Falha ao conectar ao Mercado Pago.'
    });
  }
};