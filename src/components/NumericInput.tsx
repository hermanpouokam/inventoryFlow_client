import React, { useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

type NumericTextFieldProps = Omit<TextFieldProps, 'variant'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage: string;
};

const NumericTextField: React.FC<NumericTextFieldProps> = ({ label, value, onChange, errorMessage, ...props }) => {
  const [error, setError] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Vérifie si la valeur contient des caractères non numériques
    if (/[^0-9]/.test(newValue)) {
      setError(true);
    } else {
      setError(false);
      onChange(newValue);
    }
  };

  return (
    <TextField
      label={label}
      value={value}
      onChange={handleChange}
      error={error}
      helperText={error ? errorMessage : ''}
      inputProps={{
        inputMode: 'numeric', // Permet l'entrée numérique sur mobile
        pattern: '[0-9]*', // Restreint aux chiffres uniquement
        maxLength: 10, // Limite optionnelle du nombre de caractères
      }}
      fullWidth
      {...props}
    />
  );
};

export default NumericTextField;
