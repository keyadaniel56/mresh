/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'client';
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'hair' | 'nails' | 'skincare' | 'makeup';
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
}

export interface Booking {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  remindMethod: 'none' | 'sms' | 'email' | 'both';
  remindStatus: 'pending' | 'sent' | 'failed';
  depositAmount: number; // prepaid deposit amount (e.g. KES 500 or KES 1000)
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed';
  transactionId?: string; // M-Pesa Receipt Number e.g. QGR219SDKA
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  clientName: string;
  rating: number; // 1 to 5
  text: string;
  serviceId?: string;
  approved: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  readTime: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // userId or 'ai-bot'
  senderName: string;
  text: string;
  recipientId: string; // 'admin' or 'client-id' or 'ai-bot'
  isFromAi: boolean;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string; // e.g. "LOGIN", "BOOKING_CREATE", "PAYMENT_RECEIVE", "REVIEW_SUBMIT"
  details: string; // Human readable description
  userId?: string;
  userEmail?: string;
}

export interface MpesaTransaction {
  id: string;
  checkoutRequestID: string;
  merchantRequestID: string;
  amount: number;
  phone: string;
  status: 'pending' | 'success' | 'failed';
  resultCode?: number;
  resultDesc?: string;
  transactionDate?: string;
  bookingId?: string;
  giftCardCode?: string;
}

export interface GiftCard {
  id: string;
  code: string; // Code like MRESH-GIFT-XXXX
  buyerName: string;
  recipientEmail: string;
  amount: number;
  balance: number;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string; // Unique code e.g. MRESH-VIP-500, GLAM20
  type: 'fixed' | 'percentage'; // Fixed KES discount or percentage off
  value: number; // e.g., 500 for KES 500 or 20 for 20%
  minSpend?: number; // Minimum bill requirement
  usageLimit?: number; // Maximum times this voucher can be used
  usedCount: number; // Number of times redeemed
  validUntil?: string; // Expiry YYYY-MM-DD
  status: 'active' | 'disabled' | 'expired';
  description?: string;
  createdAt: string;
}

export interface VoucherRedemption {
  id: string;
  voucherId: string;
  code: string;
  userId: string;
  userEmail?: string;
  bookingId?: string;
  discountApplied: number;
  redeemedAt: string;
}

