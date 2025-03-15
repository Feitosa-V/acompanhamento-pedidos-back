"use strict"; 
Object.defineProperty(exports, "__esModule", { value: true });

const _Order = require('../models/Order'); // Importando o modelo de pedidos

class DashboardsController {
  
  // Função para buscar dados do dashboard
  async store(req, res) {
    try {
      // O userId é enviado pelo middleware de autenticação
      const userId = req.user.id;

      // Buscar total de pedidos feitos pelo usuário
      const totalOrders = await _Order.default.countDocuments({ 'seller.id': userId });

    //   return res.status(200).json({
    //     totalOrders: totalOrders,
    //     userId : userId,
    //     User: req.user
    // });
    

      // Buscar total de vendas completadas (considerando status de pagamento)
      const totalSales = await _Order.default.countDocuments({
        'seller.id': userId,
        'payment.status': 'succeeded'  // Supondo que "succeeded" indica vendas completadas
      });

      // Soma o valor total dos pedidos (amount da payment)
      const totalAmount = await _Order.default.aggregate([
        { $match: { 'seller.id': userId } }, // Filtra pedidos do usuário
        { $group: { _id: null, totalAmount: { $sum: '$payment.amount' } } } // Soma o valor total
      ]);

      // Calcula o ticket médio (média de valor dos pedidos por venda completada)
      const averageTicket = totalSales > 0 ? totalAmount[0]?.totalAmount / totalSales : 0;

      // Buscar detalhes dos pedidos do usuário (formato detalhado)
      const ordersDetails = await _Order.default.find({ 'seller.id': userId })
        .select('customer seller payment delivery products')  // Seleciona apenas os campos necessários
        .lean();  // Converte os documentos para um formato simples (sem métodos do Mongoose)

      // Preparar o JSON final conforme o formato necessário
      const formattedOrders = ordersDetails.map(order => ({
        customer: {
            name: order.customer.name,
            doc: order.customer.doc,
            email: order.customer.email,
            phone: order.customer.phone,
        },
        seller: {
            id: order.seller.id,
            name: order.seller.name,
            email: order.seller.email,
        },
        payment: {
            amount: order.payment.amount,
            original_amount: order.payment.original_amount,
            status: order.payment.status,
            discount: order.payment.discount,
            method: order.payment.method,
            transaction_id: order.payment.id,
            installments: order.payment.installments,
            date: order.payment.date,
        },
        delivery: {
            address: order.delivery.address,
            status: order.delivery.status,
            type: order.delivery.type,
            track_id: order.delivery.track_id,
            track_url: order.delivery.track_url,
            amount: order.delivery.amount,
            delivery_forecast: order.delivery.delivery_forecast,
        },
        products: order.products.map(product => ({
            id: product.id,
            seller_id: product.seller_id,
            name: product.name,
            quantity: product.quantity,
            sku: product.sku,
            image: product.image,
            status: product.status,
            price: product.price,
            discount: product.discount,
            original_price: product.original_price,
            rating: product.rating,
            replacement_coupon: product.replacement_coupon,
            coupon: product.coupon,
            promotion: product.promotion,
            amount: product.amount,
            history: product.history,
            active: product.active,
        })),
        coupon: order.coupon
            ? {
                id: order.coupon.id,
                code: order.coupon.code,
                name: order.coupon.name,
                discount: order.coupon.discount,
                type: order.coupon.type,
                application: order.coupon.application,
            }
            : null,
        invoices: order.invoices
            ? order.invoices.map(invoice => ({
                id: invoice.id,
                createdAt: invoice.createdAt,
                status: invoice.status,
            }))
            : [],
        order_seller_id: order.order_seller_id,
        status: order.status,
        partner: order.partner
            ? {
                id: order.partner.id,
                name: order.partner.name,
                doc: order.partner.doc,
                sales_commission: order.partner.sales_commission,
                sales_percentual: order.partner.sales_percentual,
            }
            : null,
        refund: order.refund
            ? {
                bank: order.refund.bank,
                agency: order.refund.agency,
                account: order.refund.account,
            }
            : null,
        replacement_product: order.replacement_product
            ? {
                type: order.replacement_product.type,
                reason: order.replacement_product.reason,
                comment: order.replacement_product.comment,
                products: order.replacement_product.products.map(product => ({
                    _id: product._id,
                    attributes: product.attributes.map(attr => ({
                        _id: attr._id,
                    })),
                    quantity: product.quantity,
                })),
            }
            : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user_id: order.user_id,
    }));

      // Resumo
      const summary = {
        orders_total: totalAmount[0]?.totalAmount || 0,
        orders_count: totalOrders,
        sales_total: totalAmount[0]?.totalAmount || 0,
        sales_count: totalSales,
        average_ticket: averageTicket
      };

      // Retorna o resultado no formato esperado
    return res.status(200).json({
        summary: summary,
        orders: formattedOrders,
        has_more: false,
        limit: 100,
        total_pages: 1,
        page: 1,
        total: ordersDetails.length,
    });

    } catch (error) {
      console.error('Erro no Dashboard:', error);
      return res.status(500).json({
        error: true,
        message: 'Erro ao obter dados do dashboard. Tente novamente.'
      });
    }
  }
}

exports.default = new DashboardsController();
