// components/PhoneNumberWithCountryPicker.tsx
import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import CountryPicker from './CountryPicker';
import PhoneNumberInput from './PhoneNumberInput';

const PhoneNumberWithCountryPicker: React.FC = () => {
    const [countryCode, setCountryCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCountryCode(event.target.value);
    };

    const handlePhoneNumberChange = (value: string) => {
        setPhoneNumber(value);
    };

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <CountryPicker value={countryCode} onChange={handleCountryChange} />
            <PhoneNumberInput
                label="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                InputProps={{
                    startAdornment: (
                        <TextField
                            variant="standard"
                            value={countryCode}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    ),
                }}
            />
        </Box>
    );
};

export default PhoneNumberWithCountryPicker;
