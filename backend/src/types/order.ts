export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STORE_PICKUP = 'STORE_PICKUP',
}

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transferAmount: number;
  reference: string;
}
