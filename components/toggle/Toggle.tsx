import React, { useState } from 'react';

interface ToggleProps {
  defaultValue: boolean;
  labels: [string, string];
  values: [string, string];
  onChange: (checked: boolean, value: string) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  defaultValue,
  labels,
  values,
  onChange
}) => {
  const [isVAD, setIsVAD] = useState(defaultValue);

  const handleToggle = (isVADMode: boolean) => {
    setIsVAD(isVADMode);
    onChange(isVADMode, isVADMode ? values[1] : values[0]);
  };

  return (
    <div className="inline-flex rounded-full bg-gray-100 p-0.5">
      <button
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
          !isVAD 
            ? 'bg-black text-white' 
            : 'text-gray-500'
        }`}
        onClick={() => handleToggle(false)}
      >
        {labels[0]}
      </button>
      <button
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
          isVAD 
            ? 'bg-black text-white' 
            : 'text-gray-500'
        }`}
        onClick={() => handleToggle(true)}
      >
        {labels[1]}
      </button>
    </div>
  );
}; 