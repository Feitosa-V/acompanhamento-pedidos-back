import Order from "../models/Order";

class DashboardsController {
  async store(req, res) {
    try {
      const userId = req.user.id;

      // Pegando os parâmetros da requisição (com valores padrão)
      let { page = 1, limit = 10 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      // Buscar total de pedidos feitos pelo usuário
      const totalOrders = await Order.countDocuments({ 'seller.id': userId });

      // Buscar total de vendas completadas (considerando status de pagamento)
      const totalSales = await Order.countDocuments({
        'seller.id': userId,
        'payment.status': 'succeeded'
      });

      // Soma o valor total dos pedidos (amount da payment)
      const totalAmount = await Order.aggregate([
        { $match: { 'seller.id': userId } },
        { $group: { _id: null, totalAmount: { $sum: '$payment.amount' } } }
      ]);

      const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

      // Calcula o ticket médio (média de valor dos pedidos por venda completada)
      const averageTicket = totalSales > 0 ? totalAmountValue / totalSales : 0;

      // Buscar detalhes dos pedidos do usuário com paginação
      const ordersDetails = await Order.find({ 'seller.id': userId })
        .select('customer seller payment delivery products coupon invoices order_seller_id status partner refund replacement_product createdAt updatedAt user_id')
        .skip(skip)
        .limit(limit)
        .lean();

      // Formatar os pedidos
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
        delivery: order.delivery ? {
          address: order.delivery.address,
          status: order.delivery.status,
          type: order.delivery.type,
          track_id: order.delivery.track_id,
          track_url: order.delivery.track_url,
          amount: order.delivery.amount,
          delivery_forecast: order.delivery.delivery_forecast,
        } : null,
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
        coupon: order.coupon ? {
          id: order.coupon.id,
          code: order.coupon.code,
          name: order.coupon.name,
          discount: order.coupon.discount,
          type: order.coupon.type,
          application: order.coupon.application,
        } : null,
        invoices: order.invoices ? order.invoices.map(invoice => ({
          id: invoice.id,
          createdAt: invoice.createdAt,
          status: invoice.status,
        })) : [],
        order_seller_id: order.order_seller_id,
        status: order.status,
        partner: order.partner ? {
          id: order.partner.id,
          name: order.partner.name,
          doc: order.partner.doc,
          sales_commission: order.partner.sales_commission,
          sales_percentual: order.partner.sales_percentual,
        } : null,
        refund: order.refund ? {
          bank: order.refund.bank,
          agency: order.refund.agency,
          account: order.refund.account,
        } : null,
        replacement_product: order.replacement_product ? {
          type: order.replacement_product.type,
          reason: order.replacement_product.reason,
          comment: order.replacement_product.comment,
          products: order.replacement_product.products.map(product => ({
            _id: product._id,
            attributes: product.attributes.map(attr => ({ _id: attr._id })),
            quantity: product.quantity,
          })),
        } : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user_id: order.user_id,
      }));

      // Cálculo do total de páginas e se há mais registros
      const totalPages = Math.ceil(totalOrders / limit);
      const hasMore = page < totalPages;

      // Retorno da API com paginação dinâmica
      return res.status(200).json({
        orders_total: totalAmountValue,
        orders_count: totalOrders,
        sales_total: totalAmountValue,
        sales_count: totalSales,
        average_ticket: averageTicket,
        orders: formattedOrders,
        has_more: hasMore,
        limit,
        total_pages: totalPages,
        page,
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

export default new DashboardsController();
