// components/PhoneNumberInput.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { IMaskInput } from 'react-imask';

interface CustomProps {
    inputRef: React.Ref<HTMLInputElement>;
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const TextMaskCustom = React.forwardRef<HTMLElement, CustomProps>(
    function TextMaskCustom(props, ref) {
        const { onChange, ...other } = props;
        return (
            <IMaskInput
                {...other}
                mask="+{#} (000) 000-0000"
                definitions={{
                    '#': /\d/,
                }}
                inputRef={ref}
                onAccept={(value: any) =>
                    onChange({ target: { name: props.name, value } })
                }
                overwrite
            />
        );
    }
);

interface PhoneNumberInputProps extends Omit<TextFieldProps, 'onChange'> {
    onChange: (value: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    onChange,
    ...props
}) => {
    return (
        <TextField
            {...props}
            InputProps={{
                inputComponent: TextMaskCustom as any,
            }}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default PhoneNumberInput;
