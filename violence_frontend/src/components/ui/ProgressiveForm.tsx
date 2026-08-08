import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './button';

interface FormStep {
  id: string;
  title: string;
  fields: React.ReactNode;
  isOptional?: boolean;
}

interface ProgressiveFormProps {
  steps: FormStep[];
  onComplete: () => void;
  className?: string;
}

export const ProgressiveForm: React.FC<ProgressiveFormProps> = ({
  steps,
  onComplete,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Progress indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-bold text-slate-900">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200">
          <motion.div
            className="h-2 rounded-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              {currentStepData.title}
            </h2>
            {currentStepData.isOptional && (
              <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                Optional
              </span>
            )}
          </div>

          <div className="space-y-4">{currentStepData.fields}</div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        <Button
          type="button"
          onClick={nextStep}
          className="flex flex-1 items-center justify-center gap-2"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
