import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';

const ProcessingLoader = ({ currentStep, processSteps }) => {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
          Sorğu işlənir...
        </h3>
        
        <div className="space-y-4">
          {processSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < currentStep 
                  ? 'bg-green-100 text-green-600' 
                  : index === currentStep 
                  ? 'bg-blue-100 text-blue-600 animate-pulse' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className={`text-sm ${
                  index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingLoader;