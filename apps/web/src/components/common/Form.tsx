import React from 'react';
import { useForm, UseFormProps, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface FormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  onSubmit: SubmitHandler<T>;
  defaultValues?: Partial<T>;
  children: (props: {
    register: UseFormProps<T>['register'];
    formState: {
      errors: Record<string, any>;
      isSubmitting: boolean;
    };
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  }) => React.ReactNode;
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
}: FormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {children({
        register,
        formState: { errors, isSubmitting },
        handleSubmit: handleSubmit(onSubmit),
      })}
    </form>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register: any;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  register: any;
  required?: boolean;
}

export function FormSelect({
  label,
  name,
  options,
  error,
  register,
  required = false,
}: FormSelectProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormCheckboxProps {
  label: string;
  name: string;
  error?: string;
  register: any;
}

export function FormCheckbox({ label, name, error, register }: FormCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={name}
        {...register(name)}
        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
          error ? 'border-red-500' : ''
        }`}
      />
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormButtonProps {
  type?: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function FormButton({
  type = 'submit',
  variant = 'primary',
  isLoading = false,
  children,
  onClick,
}: FormButtonProps) {
  const baseClasses =
    'inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary:
      'border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
