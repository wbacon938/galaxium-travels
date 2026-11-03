import { useState, useEffect } from 'react';
import type { Flight, SeatClass } from '../../types';
import { Modal, Button } from '../common';
import { Plane, Calendar, Clock, DollarSign, Users, Crown, Sparkles, Check } from 'lucide-react';
import { formatCurrency, formatDate, calculateDuration } from '../../utils/formatters';
import { bookFlight, isErrorResponse } from '../../services/api';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight | null;
  initialClass?: SeatClass;
  onSuccess: () => void;
}

export const BookingModal = ({ isOpen, onClose, flight, initialClass = 'economy', onSuccess }: BookingModalProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SeatClass>(initialClass);

  useEffect(() => {
    if (flight) {
      if (initialClass && (flight[`seats_${initialClass}` as keyof Flight] as number) > 0) {
        setSelectedClass(initialClass);
      } else if ((flight.seats_economy ?? 0) > 0) {
        setSelectedClass('economy');
      } else if ((flight.seats_business ?? 0) > 0) {
        setSelectedClass('business');
      } else if ((flight.seats_galaxium ?? 0) > 0) {
        setSelectedClass('galaxium');
      } else {
        setSelectedClass('economy');
      }
    }
  }, [flight, initialClass]);

  if (!flight) return null;

  const currentPrice =
    selectedClass === 'economy'
      ? (flight.price_economy ?? flight.price ?? 0)
      : selectedClass === 'business'
      ? (flight.price_business ?? Math.round((flight.price || 0) * 1.75))
      : (flight.price_galaxium ?? Math.round((flight.price || 0) * 3.5));

  const classOptions: {
    key: SeatClass;
    name: string;
    icon: typeof Users;
    price: number;
    seats: number;
    color: string;
    features: string[];
  }[] = [
    {
      key: 'economy',
      name: 'Economy',
      icon: Users,
      price: flight.price_economy ?? flight.price ?? 0,
      seats: flight.seats_economy ?? 0,
      color: 'text-alien-green',
      features: ['Standard Stasis Pod', 'Hydration Pack', 'Sub-light Entertainment'],
    },
    {
      key: 'business',
      name: 'Business',
      icon: Crown,
      price: flight.price_business ?? Math.round((flight.price || 0) * 1.75),
      seats: flight.seats_business ?? 0,
      color: 'text-cosmic-purple',
      features: ['Spacious Cabin', 'Hyperdrive Lounge Access', 'Priority Orbiting'],
    },
    {
      key: 'galaxium',
      name: 'Galaxium',
      icon: Sparkles,
      price: flight.price_galaxium ?? Math.round((flight.price || 0) * 3.5),
      seats: flight.seats_galaxium ?? 0,
      color: 'text-solar-orange',
      features: ['Zero-G Luxury Suite', 'Dedicated AI Butler', 'Warp VIP Boarding'],
    },
  ];

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a flight');
      return;
    }

    setIsLoading(true);

    try {
      const result = await bookFlight({
        user_id: user.user_id,
        name: user.name,
        flight_id: flight.flight_id,
        seat_class: selectedClass,
      });

      if (isErrorResponse(result)) {
        toast.error(result.details || result.error);
        return;
      }

      toast.success(`${selectedClass.toUpperCase()} class flight booked successfully!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.details || error.error || 'Failed to book flight');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Class & Confirm Booking"
      size="lg"
    >
      <div className="space-y-5">
        {/* Flight Summary */}
        <div className="glass-card p-4 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cosmic-gradient">
              <Plane className="text-white" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-star-white">
                {flight.origin} → {flight.destination}
              </h3>
              <p className="text-xs text-star-white/60">
                Flight #{flight.flight_id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="text-cosmic-purple" size={16} />
              <div>
                <p className="text-star-white/50 text-[10px]">Departure</p>
                <p className="text-star-white font-medium">{formatDate(flight.departure_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-cosmic-purple" size={16} />
              <div>
                <p className="text-star-white/50 text-[10px]">Arrival</p>
                <p className="text-star-white font-medium">{formatDate(flight.arrival_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-cosmic-purple" size={16} />
              <div>
                <p className="text-star-white/50 text-[10px]">Duration</p>
                <p className="text-star-white font-medium">{calculateDuration(flight.departure_time, flight.arrival_time)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Class Selection */}
        <div>
          <label className="block text-xs font-semibold text-star-white/70 uppercase tracking-wider mb-2">
            Select Cabin Class
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {classOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedClass === option.key;
              const isSoldOut = option.seats === 0;

              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => setSelectedClass(option.key)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-cosmic-purple bg-cosmic-purple/15 ring-2 ring-cosmic-purple/40 shadow-lg shadow-cosmic-purple/20'
                      : isSoldOut
                      ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-cosmic-purple flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={16} className={option.color} />
                      <span className="text-sm font-bold text-star-white">{option.name}</span>
                    </div>
                    <div className="text-base font-extrabold text-star-white mb-2">
                      {formatCurrency(option.price)}
                    </div>
                    <ul className="space-y-1 mb-3">
                      {option.features.map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-star-white/70 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-cosmic-purple shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[11px] font-medium">
                    {isSoldOut ? (
                      <span className="text-red-400">Sold Out</span>
                    ) : (
                      <span className="text-alien-green">{option.seats} seat{option.seats === 1 ? '' : 's'} available</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passenger Info */}
        {user && (
          <div className="glass-card p-3 bg-white/5 flex items-center justify-between text-xs">
            <div>
              <p className="text-star-white/50">Passenger</p>
              <p className="text-star-white font-semibold">{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-star-white/50">Email</p>
              <p className="text-star-white">{user.email}</p>
            </div>
          </div>
        )}

        {/* Total Price Banner */}
        <div className="flex items-center justify-between p-4 glass-card bg-cosmic-gradient rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="text-white" size={20} />
              <span className="text-white font-semibold text-sm">
                Total ({selectedClass.toUpperCase()} Class)
              </span>
            </div>
            <p className="text-[11px] text-white/80">All interstellar taxes and fuel included</p>
          </div>
          <span className="text-2xl font-black text-white">
            {formatCurrency(currentPrice)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBooking}
            isLoading={isLoading}
            className="flex-1"
          >
            Confirm {selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1)} Booking
          </Button>
        </div>

        <p className="text-[11px] text-star-white/50 text-center">
          By confirming, you agree to Galaxium Travels interplanetary terms and transit safety codes.
        </p>
      </div>
    </Modal>
  );
};

// Made with Bob
