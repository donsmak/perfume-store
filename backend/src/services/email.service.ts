import nodemailer from 'nodemailer';
import { OrderStatus } from '../types/order';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOrderConfirmation(order: any, user: any) {
    const template = `
      Dear ${user.firstName},

      Thank you for your order #${order.id}

      Order Details:
      ${order.items
        .map((item: any) => `- ${item.product.name}: ${item.quantity} x ${item.price} MAD`)
        .join('\n')}

      Total: ${order.total} MAD

      Payment Method: ${order.paymentMethod}
      ${
        order.paymetMethod === 'BANK_TRANSFER'
          ? `\nBank Transfer Details:
        Bank: ${process.env.BANK_NAME}
        Account: ${process.env.BANK_ACCOUNT}
        Reference: ${order.id}
        `
          : ''
      }

      We will process your order soon.
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: `Order Confirmation #${order.id}`,
      text: template,
    });
  }
}
