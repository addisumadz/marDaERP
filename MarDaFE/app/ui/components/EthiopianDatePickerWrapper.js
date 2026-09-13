import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import EthiopianCalendarConverterPure from '../../lib/ethiopianCalendarConverterPure';

/**
 * Ethiopian Date Picker Wrapper Component
 * 
 * This component provides a consistent interface for Ethiopian date input
 * that works with your backend DTO and converter logic.
 */
const EthiopianDatePickerWrapper = ({ 
  value, 
  onChange, 
  label = "Date", 
  error = false, 
  helperText = "", 
  required = false,
  disabled = false,
  size = "small",
  ...props 
}) => {
  
  // Convert Gregorian value to Ethiopian for display
  const getEthiopianDisplayValue = () => {
    if (!value) return '';
    
    try {
      if (typeof value === 'string') {
        // If it's already an Ethiopian date string, use it
        if (value.includes('/') || value.includes('-')) {
          return value;
        }
        // If it's a Gregorian date string, convert it
        const gregorianDate = new Date(value);
        return EthiopianCalendarConverterPure.toEthiopianInputValue(gregorianDate);
      } else if (value instanceof Date) {
        return EthiopianCalendarConverterPure.toEthiopianInputValue(value);
      }
      return '';
    } catch (error) {
      console.error('Error converting date for display:', error);
      return '';
    }
  };

  // Handle Ethiopian date input and convert to Gregorian for backend
  const handleDateChange = (event) => {
    const ethiopianDateString = event.target.value;
    
    if (!ethiopianDateString) {
      onChange(null);
      return;
    }

    try {
      // Convert Ethiopian input to Gregorian date for backend
      const gregorianDate = EthiopianCalendarConverterPure.fromEthiopianInputValue(ethiopianDateString);
      onChange(gregorianDate);
    } catch (error) {
      console.error('Error converting Ethiopian date:', error);
      // Still call onChange with the raw string so parent can handle validation
      onChange(ethiopianDateString);
    }
  };

  // Validate Ethiopian date format
  const validateEthiopianDate = (dateString) => {
    if (!dateString) return { isValid: true, message: '' };
    
    try {
      EthiopianCalendarConverterPure.parseEthiopianDate(dateString);
      return { isValid: true, message: '' };
    } catch (error) {
      return { 
        isValid: false, 
        message: 'Invalid Ethiopian date format. Use DD/MM/YYYY or DD-MM-YYYY' 
      };
    }
  };

  const displayValue = getEthiopianDisplayValue();
  const validation = validateEthiopianDate(displayValue);
  const showError = error || !validation.isValid;
  const displayHelperText = helperText || validation.message || 'Ethiopian Calendar (DD/MM/YYYY)';

  return (
    <Box>
      <TextField
        type="date"
        label={label}
        value={displayValue}
        onChange={handleDateChange}
        error={showError}
        helperText={displayHelperText}
        required={required}
        disabled={disabled}
        size={size}
        InputLabelProps={{ shrink: true }}
        {...props}
      />
      {displayValue && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Ethiopian: {displayValue}
        </Typography>
      )}
    </Box>
  );
};

export default EthiopianDatePickerWrapper;
