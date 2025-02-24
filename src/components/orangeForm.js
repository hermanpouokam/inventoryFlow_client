'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { TextField, MenuItem } from '@mui/material';
import mtnLogo from '@/assets/img/mtn.png';
import orangeLogo from '@/assets/img/orange.png';

const prefixes = {
    cameroon: {
        mtn: /^(67|68|650|651|652|653)\d{6}$/,
        orange: /^(69|655|656|657|658|659)\d{6}$/
    },
    ivoryCoast: {
        mtn: /^(05|06)\d{7}$/,
        orange: /^(07|08)\d{7}$/
    },
    uganda: {
        mtn: /^(77|78|39)\d{7}$/,
        orange: /^(75|70)\d{7}$/
    }
};

const countries = [
    { value: 'cameroon', label: 'Cameroon' },
    { value: 'ivoryCoast', label: 'Ivory Coast' },
    { value: 'uganda', label: 'Uganda' }
];

const logos = {
    mtn: mtnLogo.src,
    orange: orangeLogo.src
};

export default function NumberForm({ onChange }) {
    const { control, watch, formState: { errors } } = useForm();
    const [cardType, setCardType] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('cameroon');

    // Watch the phone number input
    const phoneNumber = watch('phoneNumber', '');

    // Validate number by country
    const validateNumber = (num, country) => {
        const cleaned = num.replace(/\D/g, '');
        const rules = prefixes[country];
        if (rules.mtn.test(cleaned)) return 'mtn';
        if (rules.orange.test(cleaned)) return 'orange';
        return '';
    };

    useEffect(() => {
        const type = validateNumber(phoneNumber, selectedCountry);
        setCardType(type);
        onChange && onChange({ phoneNumber, type });
    }, [phoneNumber, selectedCountry, onChange]);

    return (
        <div className="mx-auto p-4 rounded-lg bg-white">
            {/* Country Selector */}
            <div className="mb-4">
                <TextField
                    select
                    label="Select Country"
                    size='small'
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    fullWidth
                >
                    {countries.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </div>

            {/* Phone Number Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                    <Controller
                        name="phoneNumber"
                        control={control}
                        rules={{ required: 'Phone number is required' }}
                        render={({ field }) => (
                            <InputMask
                                mask="999 999 999"
                                {...field}
                                placeholder="Enter phone number"
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                            >
                                {(inputProps) => (
                                    <TextField
                                        {...inputProps}
                                        size='small'
                                        fullWidth
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber?.message}
                                    />
                                )}
                            </InputMask>
                        )}
                    />
                    {cardType && (
                        <span className="absolute right-0 top-1/2 bottom-1/2 transform -translate-y-1/2">
                            <img
                                src={logos[cardType]}
                                alt={`${cardType} logo`}
                                className="w-auto h-8"
                            />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
