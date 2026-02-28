import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Zap, 
  Sparkles, 
  Clock, 
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const HealingServiceBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  // Service data
  const services = [
    {
      id: 'emotional',
      title: 'Emotional Healing',
      icon: Heart,
      description: 'Process past wounds, heal trauma, and find emotional balance through guided inner work.',
      color: 'from-pink-500 to-rose-500',
      gradient: 'rgba(236, 72, 153, 0.2)'
    },
    {
      id: 'energy',
      title: 'Energy Healing',
      icon: Zap,
      description: 'Clear energetic blockages, balance chakras, and restore your natural energy flow.',
      color: 'from-purple-500 to-indigo-500',
      gradient: 'rgba(139, 92, 246, 0.2)'
    },
    {
      id: 'spiritual',
      title: 'Spiritual Guidance',
      icon: Sparkles,
      description: 'Connect with your soul\'s purpose, receive intuitive guidance, and deepen your practice.',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'rgba(59, 130, 246, 0.2)'
    }
  ];

  // Duration options
  const durations = [
    { id: '30min', label: '30 min', price: '$97', description: 'Quick session' },
    { id: '60min', label: '60 min', price: '$147', description: 'Standard session' },
    { id: '90min', label: '90 min', price: '$197', description: 'Deep healing' }
  ];

  // Time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  // Scroll to step when selected
  useEffect(() => {
    if (selectedService && currentStep === 1) {
      setCurrentStep(2);
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDuration && currentStep === 2) {
      setCurrentStep(3);
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedDuration]);

  // Handle service selection
  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
  };

  // Handle duration selection
  const handleDurationSelect = (durationId) => {
    setSelectedDuration(durationId);
  };

  // Go back to previous step
  const goToStep = (step) => {
    setCurrentStep(step);
    if (step === 1) {
      setSelectedDuration(null);
      setSelectedDate('');
      setSelectedTime('');
    } else if (step === 2) {
      setSelectedDate('');
      setSelectedTime('');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b1b3a] via-[#1a1b4b] to-[#0f172a] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Begin Your{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Healing Journey
            </span>
          </h1>
          <p className="text-purple-200/80 text-lg">
            Select the path that resonates with your soul
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center mb-16 gap-4"
        >
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => goToStep(step)}
                className={`relative cursor-pointer group`}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  backdrop-blur-xl border-2 transition-all duration-300
                  ${currentStep >= step 
                    ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30' 
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                  }
                `}>
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                  ) : (
                    <span className={`text-lg font-semibold ${currentStep >= step ? 'text-white' : 'text-white/50'}`}>
                      {step}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-sm font-medium ${currentStep >= step ? 'text-purple-300' : 'text-white/40'}`}>
                    {step === 1 ? 'Choose Service' : step === 2 ? 'Select Duration' : 'Pick Time'}
                  </span>
                </div>
              </motion.div>
              {step < 3 && (
                <motion.div 
                  animate={{ 
                    backgroundColor: currentStep > step ? '#c084fc' : 'rgba(255,255,255,0.1)'
                  }}
                  className="w-20 h-0.5 rounded-full"
                  style={{ 
                    background: currentStep > step 
                      ? 'linear-gradient(90deg, #c084fc, #f472b6)' 
                      : 'rgba(255,255,255,0.1)'
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Step 1: Service Selection */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-20"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-semibold text-white mb-8 text-center"
              >
                Choose Your Healing Service
              </motion.h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {services.map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedService === service.id;

                  return (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: isSelected ? 1.05 : 1.03,
                        transition: { type: 'spring', stiffness: 400, damping: 17 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`
                        relative backdrop-blur-xl rounded-2xl p-8 cursor-pointer
                        border-2 transition-all duration-300
                        ${isSelected 
                          ? 'border-purple-400 bg-white/15 shadow-2xl shadow-purple-500/30 scale-105' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }
                        ${!isSelected && selectedService && 'opacity-50'}
                      `}
                    >
                      {/* Glow effect when selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle at 50% 50%, ${service.gradient}, transparent 70%)`,
                            filter: 'blur(20px)',
                            zIndex: -1
                          }}
                        />
                      )}

                      <div className="relative z-10">
                        <motion.div 
                          animate={isSelected ? { 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.2, 1.1, 1]
                          } : {}}
                          transition={{ duration: 0.5 }}
                          className={`
                            w-16 h-16 rounded-xl mb-6 flex items-center justify-center
                            bg-gradient-to-br ${service.color} bg-opacity-20
                          `}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>

                        <h3 className="text-xl font-semibold text-white mb-2">
                          {service.title}
                        </h3>
                        <p className="text-purple-200/70 text-sm leading-relaxed">
                          {service.description}
                        </p>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center gap-2 text-purple-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Selected</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Continue hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-center text-purple-300/60 mt-8 flex items-center justify-center gap-2"
              >
                Select a service to continue <ChevronRight className="w-4 h-4" />
              </motion.p>
            </motion.div>
          )}

          {/* Step 2: Duration Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              ref={step2Ref}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-20"
            >
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => goToStep(1)}
                className="flex items-center gap-2 text-purple-300 mb-8 hover:text-purple-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to services
              </motion.button>

              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-semibold text-white mb-8 text-center"
              >
                Select Session Duration
              </motion.h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              >
                {durations.map((duration) => {
                  const isSelected = selectedDuration === duration.id;

                  return (
                    <motion.div
                      key={duration.id}
                      variants={itemVariants}
                      whileHover={{ 
                        scale: isSelected ? 1.05 : 1.03,
                        transition: { type: 'spring', stiffness: 400, damping: 17 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDurationSelect(duration.id)}
                      className={`
                        relative backdrop-blur-xl rounded-2xl p-8 cursor-pointer text-center
                        border-2 transition-all duration-300
                        ${isSelected 
                          ? 'border-purple-400 bg-white/15 shadow-2xl shadow-purple-500/30 scale-105' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }
                        ${!isSelected && selectedDuration && 'opacity-50'}
                      `}
                    >
                      <motion.div 
                        animate={isSelected ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        } : {}}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4"
                      >
                        <Clock className="w-8 h-8 text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-white mb-2">
                        {duration.label}
                      </h3>
                      <p className="text-3xl font-semibold text-purple-300 mb-2">
                        {duration.price}
                      </p>
                      <p className="text-purple-200/60 text-sm">
                        {duration.description}
                      </p>

                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <CheckCircle className="w-6 h-6 text-purple-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Date & Time Picker */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              ref={step3Ref}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-20"
            >
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => goToStep(2)}
                className="flex items-center gap-2 text-purple-300 mb-8 hover:text-purple-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to duration
              </motion.button>

              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-semibold text-white mb-8 text-center"
              >
                Choose Your Date & Time
              </motion.h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl mx-auto"
              >
                {/* Date Picker */}
                <motion.div 
                  variants={itemVariants}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-6"
                >
                  <label className="flex items-center gap-3 text-white mb-4">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">Select Date</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white 
                             focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50
                             transition-all duration-300"
                  />
                </motion.div>

                {/* Time Slots */}
                <motion.div 
                  variants={itemVariants}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                  <label className="flex items-center gap-3 text-white mb-4">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">Available Times</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                          ${selectedTime === time
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                          }
                        `}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Book Button */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                                 rounded-xl font-semibold text-lg shadow-xl shadow-purple-500/30
                                 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
                    >
                      Book Healing Session
                    </motion.button>
                    <p className="text-purple-300/60 mt-4 text-sm">
                      You'll receive a confirmation email with Zoom link
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card (when step 3 is selected) */}
        {currentStep === 3 && selectedService && selectedDuration && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg"
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 
                            shadow-2xl shadow-purple-500/20"
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 
                                flex items-center justify-center">
                    {selectedService === 'emotional' && <Heart className="w-5 h-5" />}
                    {selectedService === 'energy' && <Zap className="w-5 h-5" />}
                    {selectedService === 'spiritual' && <Sparkles className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm text-purple-300">Ready to book</p>
                    <p className="font-semibold">
                      {services.find(s => s.id === selectedService)?.title} • 
                      {durations.find(d => d.id === selectedDuration)?.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-300">Total</p>
                  <p className="font-bold text-xl">
                    {durations.find(d => d.id === selectedDuration)?.price}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HealingServiceBooking;