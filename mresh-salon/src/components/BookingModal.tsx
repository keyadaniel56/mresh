import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, AlertCircle, Sparkles, Check, ChevronRight, ChevronLeft, CreditCard, Gift, Loader, Smartphone, Mail, Bell, Ticket, Tag, Percent, X as CloseIcon, CheckCircle2 } from 'lucide-react';
import { Service, Booking, GiftCard } from '../types';
import { getApiUrl } from '../lib/api';

interface BookingModalProps {
  token: string | null;
  services: Service[];
  onClose: () => void;
  onSuccess: () => void;
  onOpenLogin: () => void;
}

export default function BookingModal({ token, services, onClose, onSuccess, onOpenLogin }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [remindMethod, setRemindMethod] = useState<'none' | 'sms' | 'email' | 'both'>('sms');

  // M-Pesa or Gift Card selection
  const [payMethod, setPayMethod] = useState<'mpesa' | 'giftcard'>('mpesa');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardSuccess, setGiftCardSuccess] = useState<string | null>(null);

  // Voucher Code States
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    discountAmount: number;
    newDepositAmount: number;
  } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccessToast, setVoucherSuccessToast] = useState<{
    code: string;
    discountAmount: number;
    newDepositAmount: number;
    description?: string;
  } | null>(null);

  // M-Pesa Prompt states
  const [showMpesaPrompt, setShowMpesaPrompt] = useState(false);
  const [mpesaPin, setMpesaPin] = useState('');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaStatusText, setMpesaStatusText] = useState('');

  // Created Booking receipt
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Simulated Reminder popups
  const [showReminderNotification, setShowReminderNotification] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  // Conflict state
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  // Calculate available dates (next 10 days starting tomorrow)
  const availableDates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 10; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    availableDates.push(nextDate.toISOString().split('T')[0]);
  }

  // Common slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Fetch bookings to avoid double-bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setExistingBookings(data);
        }
      } catch (e) {
        console.error('Error loading existing bookings:', e);
      }
    };
    fetchBookings();
  }, [token]);

  // Check if a time slot on a date is taken
  const isSlotTaken = (d: string, t: string) => {
    return existingBookings.some(b => b.date === d && b.time === t && b.status !== 'cancelled');
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      setError('Please select a service menu item.');
      return;
    }
    if (step === 2 && (!date || !time)) {
      setError('Please select both a date and an hour slot.');
      return;
    }
    if (step === 2 && isSlotTaken(date, time)) {
      setError('This slot is occupied. Please select an empty hour.');
      return;
    }
    if (step === 3 && !phone.trim()) {
      setError('A valid phone number is required.');
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleValidateVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setVoucherLoading(true);
    setVoucherError(null);

    const baseDeposit = selectedService && selectedService.price >= 5000 ? 1000 : 500;
    try {
      const res = await fetch(getApiUrl('/api/vouchers/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucherCodeInput.trim().toUpperCase(),
          totalAmount: selectedService ? selectedService.price : 1000,
          depositAmount: baseDeposit
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          const discountAmt = data.discountAmount || 0;
          const newDepAmt = data.newDepositAmount !== undefined ? data.newDepositAmount : Math.max(0, baseDeposit - discountAmt);
          
          setAppliedVoucher({
            code: data.code || data.voucher?.code,
            type: data.type || data.voucher?.type,
            value: data.value || data.voucher?.value,
            discountAmount: discountAmt,
            newDepositAmount: newDepAmt
          });
          setVoucherError(null);
          setVoucherSuccessToast({
            code: data.code || data.voucher?.code,
            discountAmount: discountAmt,
            newDepositAmount: newDepAmt,
            description: data.description || data.voucher?.description
          });
        } else {
          setVoucherError(data.message || 'Invalid or expired voucher code.');
          setAppliedVoucher(null);
          setVoucherSuccessToast(null);
        }
      } else {
        const err = await res.json();
        setVoucherError(err.message || 'Invalid voucher code.');
        setAppliedVoucher(null);
        setVoucherSuccessToast(null);
      }
    } catch (e) {
      console.error(e);
      setVoucherError('Network error validating voucher code.');
      setVoucherSuccessToast(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    setVoucherError(null);
    setVoucherSuccessToast(null);
  };

  // Step 4: Create booking in system and initiate Payment
  const handleInitiateBookingAndPay = async () => {
    if (!token) {
      onOpenLogin();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create the pending booking first
      const bookingRes = await fetch(getApiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          date,
          time,
          notes,
          clientPhone: phone,
          remindMethod,
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined
        })
      });

      if (!bookingRes.ok) {
        const err = await bookingRes.json();
        throw new Error(err.error || 'Failed to initialize booking.');
      }

      const booking: Booking = await bookingRes.json();
      setConfirmedBooking(booking);

      // 2. If paying via M-Pesa
      if (payMethod === 'mpesa') {
        setShowMpesaPrompt(true);
        setMpesaStatusText('Safaricom Daraja API connecting... Sending STK Push request.');
      } else {
        // Redirection to Gift Card Step
        setStep(5); // Go directly to finalized screen for Gift Card Entry
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simulated Safaricom M-Pesa STK Authorization
  const handleAuthorizeMpesaPayment = async () => {
    if (!mpesaPin || mpesaPin.length < 4) {
      alert('Please enter your 4-digit M-Pesa PIN.');
      return;
    }

    setMpesaLoading(true);
    setMpesaStatusText('Transmitting encrypted authorization PIN to Safaricom network...');

    try {
      const res = await fetch(getApiUrl('/api/payments/stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone,
          bookingId: confirmedBooking?.id
        })
      });

      if (res.ok) {
        setMpesaStatusText('Payment Authorized! Confirming deposit with Mresh Salon...');
        setTimeout(() => {
          setShowMpesaPrompt(false);
          setStep(5); // Finalized screen
        }, 1500);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Payment rejected by Safaricom.');
      }
    } catch (e: any) {
      alert(e.message);
      setMpesaLoading(false);
      setMpesaStatusText('Payment failed. Try again.');
    }
  };

  // Gift Card payment handler
  const handleRedeemGiftCard = async () => {
    if (!giftCardCode.trim() || !confirmedBooking) return;

    setGiftCardLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/payments/giftcard/redeem'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: giftCardCode,
          bookingId: confirmedBooking.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGiftCardSuccess(data.message);
        // Refresh confirmed booking status
        setConfirmedBooking(prev => prev ? { ...prev, paymentStatus: 'paid', status: 'confirmed' } : null);
      } else {
        const err = await res.json();
        setError(err.error || 'Gift card validation failed.');
      }
    } catch (e) {
      console.error(e);
      setError('Network error validating gift card.');
    } finally {
      setGiftCardLoading(false);
    }
  };

  // Simulate Triggering Reminders
  const handleSimulateReminder = async () => {
    if (!confirmedBooking) return;

    try {
      const res = await fetch(getApiUrl(`/api/bookings/${confirmedBooking.id}/remind`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setReminderMessage(
          `🔔 Automated Reminder Sent!\n\nTo: ${confirmedBooking.clientName}\nChannel: ${remindMethod.toUpperCase()}\n\n"Hey ${confirmedBooking.clientName}, this is Mresh Salon! Gentle reminder for your upcoming ${selectedService?.name} on ${date} at ${time}. We can't wait to pamper you!"`
        );
        setShowReminderNotification(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="booking-modal-overlay" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="booking-modal-card" 
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200 text-zinc-100"
      >
        
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif italic font-medium text-lg text-white">Salon Treatment Booking</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Mresh Salon Experience</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-1.5 rounded-lg transition"
            id="close-booking-modal-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Breadcrumbs indicator */}
        <div className="px-6 py-3 border-b border-zinc-900 bg-zinc-950/40 flex items-center justify-between text-[11px] font-medium text-zinc-500">
          <span className={step >= 1 ? 'text-rose-400 font-semibold' : ''}>1. Treatment</span>
          <span className="text-zinc-800">/</span>
          <span className={step >= 2 ? 'text-rose-400 font-semibold' : ''}>2. Schedule</span>
          <span className="text-zinc-800">/</span>
          <span className={step >= 3 ? 'text-rose-400 font-semibold' : ''}>3. Details</span>
          <span className="text-zinc-800">/</span>
          <span className={step >= 4 ? 'text-rose-400 font-semibold' : ''}>4. Prepay Deposit</span>
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/30 rounded-xl p-3 flex gap-2 text-rose-300 text-xs animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">Select Treatment Category</p>
              
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s);
                      setError(null);
                    }}
                    className={`w-full text-left p-3.5 border rounded-xl flex justify-between items-center transition ${selectedService?.id === s.id ? 'bg-rose-950/20 border-rose-500 shadow-sm' : 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-800'}`}
                    id={`service-select-${s.id}`}
                  >
                    <div className="space-y-1 pr-4">
                      <span className="text-[9px] bg-zinc-900 text-rose-400 border border-rose-950/40 px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest">
                        {s.category}
                      </span>
                      <h4 className="font-serif italic text-sm text-zinc-100 mt-1.5">{s.name}</h4>
                      <p className="text-[11px] text-zinc-450 line-clamp-1">{s.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs text-white">KES {s.price}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{s.duration} mins</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME */}
          {step === 2 && selectedService && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500">Selected Treatment</span>
                  <h4 className="font-serif italic text-xs text-white">{selectedService.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-400">KES {selectedService.price}</span>
                </div>
              </div>

              {/* Date selection cards */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  Select Booking Date
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableDates.map((d) => {
                    const parsedDate = new Date(d);
                    const dayName = parsedDate.toLocaleDateString(undefined, { weekday: 'short' });
                    const dayNum = parsedDate.getDate();
                    const isSelected = date === d;

                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => {
                          setDate(d);
                          setError(null);
                        }}
                        className={`py-2 px-1 border rounded-xl flex flex-col items-center justify-center transition ${isSelected ? 'bg-rose-600 border-rose-600 text-white shadow' : 'bg-zinc-900/80 border-zinc-850 hover:border-zinc-800 text-zinc-300'}`}
                        id={`date-select-${d}`}
                      >
                        <span className={`text-[9px] uppercase font-semibold ${isSelected ? 'text-rose-100' : 'text-zinc-500'}`}>{dayName}</span>
                        <span className="text-sm font-bold mt-1">{dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time selection grid */}
              {date && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    Select Hour Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((t) => {
                      const isTaken = isSlotTaken(date, t);
                      const isSelected = time === t;

                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => {
                            if (!isTaken) {
                              setTime(t);
                              setError(null);
                            }
                          }}
                          disabled={isTaken}
                          className={`py-2 rounded-xl text-xs font-medium border transition ${isTaken ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed line-through' : isSelected ? 'bg-rose-600 border-rose-600 text-white shadow' : 'bg-zinc-900 border-zinc-850 hover:border-zinc-800 text-zinc-300'}`}
                          id={`time-select-${t}`}
                        >
                          {t} {isTaken && '(Booked)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CONTACT & REMINDERS DETAILS */}
          {step === 3 && selectedService && (
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">Client Information</p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Mobile Phone (M-Pesa registered)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg pl-9 p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Required for simulated Safaricom M-Pesa push prompts.</span>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Appointment Reminders Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sms', label: 'SMS Texts', icon: Smartphone },
                      { id: 'email', label: 'Emails', icon: Mail },
                      { id: 'both', label: 'Both channels', icon: Bell },
                    ].map((rem) => {
                      const isSel = remindMethod === rem.id;
                      const Icon = rem.icon;
                      return (
                        <button
                          type="button"
                          key={rem.id}
                          onClick={() => setRemindMethod(rem.id as any)}
                          className={`py-2.5 px-1 border rounded-xl flex flex-col items-center justify-center gap-1 transition ${isSel ? 'bg-rose-950/30 border-rose-500 text-rose-400 shadow-sm font-semibold' : 'bg-zinc-900 border-zinc-850 hover:border-zinc-800 text-zinc-400'}`}
                        >
                          <Icon className="w-4 h-4 text-rose-400/80" />
                          <span className="text-[10px]">{rem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Special requests or comments</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Any allergies? Stylist preferences? Hair texture specifics?"
                    rows={3}
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none placeholder:text-zinc-500 text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREPAID DEPOSIT INTEGRATION */}
          {step === 4 && selectedService && (
            <div className="space-y-4">
              
              {/* Animated Success Toast Banner on Voucher Redemption */}
              {voucherSuccessToast && (
                <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 border-2 border-emerald-500/80 p-4 rounded-2xl shadow-xl space-y-2.5 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-full border border-emerald-500/50 animate-bounce">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-serif italic font-bold text-base text-white flex items-center gap-2">
                          Voucher Code "{voucherSuccessToast.code}" Validated!
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-emerald-300 font-medium">
                          Immediate feedback: KES {voucherSuccessToast.discountAmount.toLocaleString()} deducted from your blowout bill!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoucherSuccessToast(null)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                      title="Dismiss toast"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-zinc-950/90 border border-emerald-800/60 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-zinc-400 text-[10px] uppercase block tracking-wider font-sans">Bill Savings</span>
                      <span className="text-emerald-400 font-bold text-sm">- KES {voucherSuccessToast.discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400 text-[10px] uppercase block tracking-wider font-sans">Updated Deposit</span>
                      <span className="text-white font-bold text-sm">KES {voucherSuccessToast.newDepositAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl text-center space-y-1.5 shadow-sm">
                <Sparkles className="w-5 h-5 text-rose-400 mx-auto" />
                <h4 className="font-serif italic text-sm text-rose-100">Prepaid Booking Deposit</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  To prevent slot cancellations, Mresh Salon requires a secure deposit. This is fully deducted from your final blowout bill.
                </p>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {appliedVoucher ? (
                    <div className="space-y-0.5">
                      <div className="text-xs text-zinc-400 line-through">
                        Original Deposit: KES {selectedService.price >= 5000 ? 1000 : 500}
                      </div>
                      <div className="text-xl font-bold text-emerald-400">
                        KES {appliedVoucher.newDepositAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-300 font-mono">
                        Voucher Discount Applied: -KES {appliedVoucher.discountAmount.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <span>KES {selectedService.price >= 5000 ? 1000 : 500}</span>
                  )}
                </div>
              </div>

              {/* Voucher Code Redemption Input Box */}
              <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-rose-400" />
                    Have a Voucher / Promo Code?
                  </label>
                  {appliedVoucher && (
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CloseIcon className="w-3 h-3" /> Remove Voucher
                    </button>
                  )}
                </div>

                {appliedVoucher ? (
                  <div className="bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold font-mono text-white">{appliedVoucher.code}</div>
                        <div className="text-[10px] text-emerald-300">
                          {appliedVoucher.type === 'fixed' 
                            ? `KES ${appliedVoucher.value} Off Applied` 
                            : `${appliedVoucher.value}% Discount Applied`}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800 font-mono">
                      - KES {appliedVoucher.discountAmount}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. MRESH500, GLAM20"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono uppercase tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleValidateVoucher}
                        disabled={voucherLoading || !voucherCodeInput.trim()}
                        className="bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        {voucherLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Redeem'}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-[11px] text-rose-400">{voucherError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment methods selector */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPayMethod('mpesa')}
                  className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition ${payMethod === 'mpesa' ? 'bg-zinc-950 border-rose-950 text-white ring-1 ring-rose-500' : 'bg-zinc-900 border-zinc-850 text-zinc-400'}`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold">Safaricom M-Pesa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('giftcard')}
                  className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition ${payMethod === 'giftcard' ? 'bg-zinc-950 border-rose-950 text-white ring-1 ring-rose-500' : 'bg-zinc-900 border-zinc-850 text-zinc-400'}`}
                >
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">Redeem Gift Card</span>
                </button>
              </div>

              {payMethod === 'mpesa' ? (
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-2 text-center animate-in fade-in duration-200">
                  <p className="text-xs text-zinc-400">
                    Pressing continue initiates an instant **Safaricom Daraja STK Push prompt** on your phone number **{phone}**.
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <label className="text-xs text-zinc-400 block mb-1">Enter Gift Card Code (MRESH-GIFT-XXXX)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      placeholder="MRESH-GIFT-8942"
                      className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none font-mono text-zinc-100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: FINAL CONFIRMED STATUS SCREEN */}
          {step === 5 && confirmedBooking && (
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
              <div className="bg-emerald-950/40 p-3.5 rounded-full w-fit mx-auto border border-emerald-800/30 shadow-sm text-emerald-400">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif italic text-lg text-white">Appointment Confirmed!</h3>
                <p className="text-xs text-zinc-400">Mresh Salon is preparing your pampering slot.</p>
              </div>

              {/* Booking Receipt details card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-left space-y-3.5 max-w-sm mx-auto shadow-sm">
                <div className="border-b border-zinc-900 pb-2.5 flex justify-between items-center text-xs">
                  <span className="font-mono text-zinc-500">ID: {confirmedBooking.id}</span>
                  <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-900/20 font-semibold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                    {confirmedBooking.paymentStatus === 'paid' ? 'Deposit Paid' : 'Pending Prepay'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">TREATMENT</span>
                    <span className="font-medium text-zinc-200">{selectedService?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">PRICE</span>
                    <span className="font-bold text-white">KES {selectedService?.price}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">SCHEDULE</span>
                    <span className="font-medium text-zinc-200">{date} at {time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">DEPOSIT SECURED</span>
                    <span className="font-bold text-rose-400">KES {confirmedBooking.depositAmount}</span>
                  </div>
                </div>

                {confirmedBooking.transactionId && (
                  <div className="border-t border-zinc-900 pt-2.5 text-center">
                    <span className="text-[10px] text-zinc-500 block">M-PESA RECEIPT NUMBER</span>
                    <span className="font-mono font-bold text-xs text-amber-400 tracking-wider">
                      {confirmedBooking.transactionId}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Simulation buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleSimulateReminder}
                  className="w-full text-xs border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-xl transition font-semibold flex items-center justify-center gap-1.5 bg-zinc-900"
                  id="simulate-reminder-btn"
                >
                  <Bell className="w-4 h-4 text-rose-400 animate-swing" />
                  Simulate Appointment Reminder
                </button>

                {payMethod === 'giftcard' && confirmedBooking.paymentStatus === 'unpaid' && (
                  <div className="space-y-2 border border-zinc-900 p-4 rounded-2xl bg-zinc-950 text-left shadow-sm">
                    <h5 className="text-xs font-semibold text-zinc-350 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      Redeem Gift Card Deposit
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                        placeholder="MRESH-GIFT-XXXX"
                        className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2 focus:outline-none text-zinc-100"
                      />
                      <button
                        onClick={handleRedeemGiftCard}
                        disabled={giftCardLoading}
                        className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs px-3.5 rounded-lg font-semibold transition"
                      >
                        {giftCardLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {giftCardSuccess && (
                      <p className="text-[10px] text-emerald-400 mt-1">{giftCardSuccess}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="w-full text-xs bg-zinc-100 hover:bg-white text-zinc-950 py-3 rounded-xl transition font-semibold shadow"
                  id="done-booking-btn"
                >
                  Complete Booking
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal footer controls (Non Step 5) */}
        {step < 5 && (
          <div className="bg-zinc-950 border-t border-zinc-900 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className="text-xs text-zinc-400 disabled:text-zinc-700 disabled:cursor-not-allowed font-medium flex items-center gap-1"
              id="prev-booking-step-btn"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-5 py-2.5 rounded-xl transition font-medium flex items-center gap-1 shadow"
                id="next-booking-step-btn"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleInitiateBookingAndPay}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-6 py-2.5 rounded-xl transition font-semibold flex items-center gap-1.5 shadow"
                id="initiate-prepayment-btn"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                {payMethod === 'mpesa' ? 'Trigger M-Pesa STK Push' : 'Initialize Gift Card Booking'}
              </button>
            )}
          </div>
        )}

      </div>

      {/* SIMULATED DARAJA M-PESA STK DIALOG OVERLAY POPUP */}
      {showMpesaPrompt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-4 border-zinc-800 rounded-[32px] w-72 h-[480px] p-4 flex flex-col justify-between text-white relative shadow-2xl overflow-hidden font-sans">
            
            {/* Phone speaker / notch */}
            <div className="bg-zinc-800 w-24 h-4 rounded-full mx-auto shrink-0 mb-4 flex justify-center items-center">
              <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
            </div>

            {/* M-Pesa SIM ToolKit popup mock panel */}
            <div className="bg-zinc-100 text-zinc-900 rounded-2xl p-5 space-y-4 shadow flex-1 flex flex-col justify-between">
              
              <div className="space-y-2.5">
                {/* Safaricom Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-[11px] font-bold text-emerald-600 tracking-wider font-sans uppercase">M-PESA Express</span>
                  <span className="text-[9px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">SIM ToolKit</span>
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="text-[11px] font-medium text-zinc-500">Merchant Payment</p>
                  <p className="text-sm font-bold text-zinc-800">MRESH SALON DEPOSIT</p>
                  <div className="bg-zinc-200/50 p-1.5 rounded-lg text-xs font-mono font-bold text-zinc-900">
                    KES {selectedService ? (selectedService.price >= 5000 ? 1000 : 500) : 500}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] text-zinc-500 text-center">
                    Enter M-Pesa 4-Digit authorization PIN to complete transaction safely:
                  </p>
                  <input
                    type="password"
                    maxLength={4}
                    value={mpesaPin}
                    onChange={(e) => setMpesaPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center tracking-widest text-lg font-bold border border-zinc-300 rounded-lg py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="mpesa-pin-field"
                  />
                </div>
              </div>

              {/* Authorization actions */}
              <div className="space-y-2">
                {mpesaLoading ? (
                  <div className="text-center text-[10px] text-emerald-600 animate-pulse font-medium py-1">
                    {mpesaStatusText}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMpesaPrompt(false)}
                      className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-[11px] py-2 rounded-lg font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAuthorizeMpesaPayment}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-2 rounded-lg font-bold transition flex items-center justify-center gap-1"
                    >
                      Authorize
                    </button>
                  </div>
                )}
                <span className="text-[8px] text-zinc-400 text-center block font-mono">Secure Connection: Safaricom Daraja API v2</span>
              </div>

            </div>

            {/* Virtual Phone Home button bar */}
            <div className="bg-zinc-800 w-16 h-1 rounded-full mx-auto shrink-0 mt-4"></div>
          </div>
        </div>
      )}

      {/* SIMULATED NOTIFICATION OVERLAY (Reminders & M-Pesa Text Messages) */}
      {showReminderNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in slide-in-from-top-6 duration-300">
          <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 shadow-2xl border border-zinc-800 flex flex-col space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-rose-600 p-1.5 rounded-lg">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-white">Notification Dispatch</h5>
                  <span className="text-[9px] text-zinc-400">Reminders Engine Simulator</span>
                </div>
              </div>
              <button 
                onClick={() => setShowReminderNotification(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs leading-relaxed font-mono whitespace-pre-line bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              {reminderMessage}
            </p>

            <button
              onClick={() => setShowReminderNotification(false)}
              className="w-full py-1 text-[10px] uppercase font-bold text-center text-rose-400 hover:text-rose-300"
            >
              Acknowledge Simulator
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline helper for closing reminder notification
interface XProps {
  className?: string;
}
function X({ className }: XProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
