import React, { useState, useEffect } from 'react';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
}

export const MoneyInput: React.FC<Props> = ({ value, onChange, className = "input-base", onFocus, onBlur, ...props }) => {
    // Local string state to handle "empty" vs "0" display
    const [displayValue, setDisplayValue] = useState<string>(value.toString());
    const [isFocused, setIsFocused] = useState(false);

    // Sync external value changes to local display state, ONLY when not focused
    // or when the numeric value of display doesn't match prop value (external update)
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(value.toString());
        } else {
            // While focused, only update if the parsed value is significantly different
            // (e.g. calculation updated state externally), but be careful not to kill typing "0."
            const currentNum = displayValue === '' ? 0 : Number(displayValue);
            if (currentNum !== value) {
                setDisplayValue(value.toString());
            }
        }
    }, [value, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (value === 0) {
            setDisplayValue('');
        }
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        // On blur, normalize display to the valid number representation
        setDisplayValue(value.toString());
        if (onBlur) onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDisplayValue(val);

        // Allow empty string (treated as 0) or valid numbers
        if (val === '') {
            onChange(0);
        } else {
            const num = Number(val);
            if (!isNaN(num)) {
                onChange(num);
            }
        }
    };

    return (
        <input
            {...props}
            type="number"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={className}
        />
    );
};
