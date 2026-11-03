import type { Booking, Flight, SeatClass } from '../../types';
import { Card, Button } from '../common';
import { Plane, Calendar, CheckCircle, XCircle, Clock, Sparkles, Crown, Users } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';

interface BookingCardProps {
  booking: Booking;
  flight?: Flight;
  onCancel: (bookingId: number) => void;
  isCancelling?: boolean;
}

export const BookingCard = ({ booking, flight, onCancel, isCancelling }: BookingCardProps) => {
  const getStatusIcon = () => {
    switch (booking.status) {
      case 'booked':
        return <CheckCircle className="text-alien-green" size={18} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={18} />;
      case 'completed':
        return <CheckCircle className="text-blue-500" size={18} />;
      default:
        return <Clock className="text-star-white/50" size={18} />;
    }
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'booked':
        return 'text-alien-green';
      case 'cancelled':
        return 'text-red-500';
      case 'completed':
        return 'text-blue-500';
      default:
        return 'text-star-white/50';
    }
  };

  const getSeatClassBadge = (seatClass?: SeatClass | string) => {
    const cls = (seatClass || 'economy').toLowerCase();
    switch (cls) {
      case 'galaxium':
        return {
          label: 'Galaxium Class',
          icon: Sparkles,
          className: 'bg-solar-orange/15 text-solar-orange border-solar-orange/30',
        };
      case 'business':
        return {
          label: 'Business Class',
          icon: Crown,
          className: 'bg-cosmic-purple/15 text-cosmic-purple border-cosmic-purple/30',
        };
      case 'economy':
      default:
        return {
          label: 'Economy Class',
          icon: Users,
          className: 'bg-alien-green/15 text-alien-green border-alien-green/30',
        };
    }
  };

  const classBadge = getSeatClassBadge(booking.seat_class);
  const ClassIcon = classBadge.icon;
  const canCancel = booking.status === 'booked';
  const pricePaid = booking.price_paid || (flight ? flight.price_economy ?? flight.price : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cosmic-gradient">
              <Plane className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-star-white/60">Booking #{booking.booking_id}</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                <span className={`text-xs font-semibold capitalize ${getStatusColor()}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${classBadge.className}`}>
            <ClassIcon size={12} />
            <span>{classBadge.label}</span>
          </div>
        </div>

        {/* Flight Details */}
        {flight ? (
          <div className="space-y-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-star-white mb-0.5">
                {flight.origin} → {flight.destination}
              </h3>
              <p className="text-xs text-star-white/60">Flight #{flight.flight_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-star-white/60 uppercase">Departure</p>
                <p className="text-xs text-star-white font-medium">
                  {formatDate(flight.departure_time)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-star-white/60 uppercase">Arrival</p>
                <p className="text-xs text-star-white font-medium">
                  {formatDate(flight.arrival_time)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-star-white/60">Price Paid</span>
              <span className="text-base font-extrabold text-star-white">
                {formatCurrency(pricePaid)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-star-white/60">Flight ID: {booking.flight_id}</p>
            {pricePaid > 0 && (
              <p className="text-sm font-semibold text-star-white mt-1">Price Paid: {formatCurrency(pricePaid)}</p>
            )}
          </div>
        )}

        {/* Booking Time */}
        <div className="flex items-center gap-2 text-sm text-star-white/60 mb-4">
          <Calendar size={16} />
          <span>Booked on {formatDate(booking.booking_time)}</span>
        </div>

        {/* Cancel Button */}
        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel(booking.booking_id)}
            isLoading={isCancelling}
            className="w-full"
          >
            Cancel Booking
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

// Made with Bob
