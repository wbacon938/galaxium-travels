import type { Flight, SeatClass } from '../../types';
import { Card, Button } from '../common';
import { Plane, Clock, Users, Crown, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, calculateDuration } from '../../utils/formatters';
import { motion } from 'framer-motion';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight, selectedClass?: SeatClass) => void;
}

export const FlightCard = ({ flight, onBook }: FlightCardProps) => {
  const totalSeats = (flight.seats_economy ?? 0) + (flight.seats_business ?? 0) + (flight.seats_galaxium ?? 0);
  const isSoldOut = totalSeats === 0;

  const classTiers: {
    key: SeatClass;
    name: string;
    icon: typeof Users;
    price: number;
    seats: number;
    color: string;
    borderColor: string;
  }[] = [
    {
      key: 'economy',
      name: 'Economy',
      icon: Users,
      price: flight.price_economy ?? flight.price ?? 0,
      seats: flight.seats_economy ?? 0,
      color: 'text-alien-green',
      borderColor: 'border-white/10 hover:border-alien-green/50',
    },
    {
      key: 'business',
      name: 'Business',
      icon: Crown,
      price: flight.price_business ?? Math.round((flight.price || 0) * 1.75),
      seats: flight.seats_business ?? 0,
      color: 'text-cosmic-purple',
      borderColor: 'border-cosmic-purple/30 hover:border-cosmic-purple',
    },
    {
      key: 'galaxium',
      name: 'Galaxium',
      icon: Sparkles,
      price: flight.price_galaxium ?? Math.round((flight.price || 0) * 3.5),
      seats: flight.seats_galaxium ?? 0,
      color: 'text-solar-orange',
      borderColor: 'border-solar-orange/30 hover:border-solar-orange',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col justify-between">
        <div>
          {/* Route Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cosmic-gradient">
                <Plane className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-star-white">
                  {flight.origin} → {flight.destination}
                </h3>
                <p className="text-sm text-star-white/60">
                  Flight #{flight.flight_id}
                </p>
              </div>
            </div>
          </div>

          {/* Departure & Arrival */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-star-white/60 mb-1">Departure</p>
              <p className="text-sm font-medium text-star-white">
                {formatDate(flight.departure_time, 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-bold text-cosmic-purple">
                {formatTime(flight.departure_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-star-white/60 mb-1">Arrival</p>
              <p className="text-sm font-medium text-star-white">
                {formatDate(flight.arrival_time, 'MMM dd, yyyy')}
              </p>
              <p className="text-lg font-bold text-cosmic-purple">
                {formatTime(flight.arrival_time)}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-star-white/70 mb-4 text-xs">
            <Clock size={14} />
            <span>Duration: {calculateDuration(flight.departure_time, flight.arrival_time)}</span>
          </div>

          {/* Seat Classes Tier List */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold text-star-white/50 uppercase tracking-wider">
              Classes & Pricing
            </p>
            <div className="grid grid-cols-3 gap-2">
              {classTiers.map((tier) => {
                const Icon = tier.icon;
                const isTierSoldOut = tier.seats === 0;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => !isTierSoldOut && onBook(flight, tier.key)}
                    disabled={isTierSoldOut}
                    className={`p-2.5 rounded-lg border text-left transition-all ${tier.borderColor} ${
                      isTierSoldOut
                        ? 'opacity-40 bg-white/5 cursor-not-allowed'
                        : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={14} className={tier.color} />
                      <span className="text-xs font-bold text-star-white">{tier.name}</span>
                    </div>
                    <div className="text-xs font-extrabold text-star-white truncate">
                      {formatCurrency(tier.price)}
                    </div>
                    <div className="text-[10px] text-star-white/60 mt-0.5">
                      {isTierSoldOut ? 'Sold Out' : `${tier.seats} seat${tier.seats === 1 ? '' : 's'}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={() => onBook(flight)}
          disabled={isSoldOut}
          className="w-full"
        >
          {isSoldOut ? 'Sold Out' : 'Select Class & Book'}
        </Button>
      </Card>
    </motion.div>
  );
};

// Made with Bob
