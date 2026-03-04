import React, { memo } from 'react';

const inputClass =
  'w-full rounded-xl border border-[#E7DBC2] bg-white px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#D4AF37]';

const AddressForm = memo(function AddressForm({ values, errors, onChange }) {
  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#7A6A4D]">
        {label}
      </label>
      <input
        id={name}
        type={type}
        value={values[name] ?? ''}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        className={`${inputClass} ${errors[name] ? 'border-red-500' : ''}`}
        autoComplete={name}
      />
      {errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('full_name', 'Full Name', 'text', 'Enter full name')}
        {field('phone', 'Phone', 'tel', '+971 5X XXX XXXX')}
      </div>

      {field('address_line_1', 'Address Line 1', 'text', 'Building, street and area')}
      {field('address_line_2', 'Address Line 2 (Optional)', 'text', 'Apartment, suite, floor')}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {field('city', 'City', 'text', 'Dubai')}
        {field('emirate', 'Emirate', 'text', 'Dubai')}
        {field('postal_code', 'Postal Code', 'text', 'Optional')}
      </div>
    </div>
  );
});

export default AddressForm;
