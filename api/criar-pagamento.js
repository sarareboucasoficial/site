export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { opcao } = req.body || {};

    const produtos = {
      sem_almoco: {
        title: "Imersão Metanoia — Sem almoço",
        price: 47
      },
      com_almoco: {
        title: "Imersão Metanoia — Com almoço",
        price: 73
      }
    };

    const produto = produtos[opcao];

    if (!produto) {
      return res.status(400).json({ error: "Opção de ingresso inválida" });
    }

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: [
            {
              id: opcao,
              title: produto.title,
              quantity: 1,
              currency_id: "BRL",
              unit_price: produto.price
            }
          ],

          back_urls: {
            success:
              "https://sarareboucas.com.br/imersao-confirmada.html",
            pending:
              "https://sarareboucas.com.br/imersao-pendente.html",
            failure:
              "https://sarareboucas.com.br/imersao-pagamento.html"
          },

          auto_return: "approved",

          external_reference: `imersao-metanoia-${opcao}-${Date.now()}`
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return res.status(response.status).json({
        error: "Não foi possível criar o pagamento",
        details: data
      });
    }

    return res.status(200).json({
      checkout_url: data.init_point
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro interno ao criar pagamento"
    });
  }
}