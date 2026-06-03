interface RegisterInputProps {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  error?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RegisterInput = ({
  name,
  label,
  type,
  placeholder,
  icon: Icon,
  value,
  error,
  required,
  minLength,
  hint,
  onChange,
}: RegisterInputProps) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`register-${name}`}
        className="block text-sm font-medium text-text-primary"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <Icon
            className={`h-5 w-5 transition-colors duration-200 ${
              error
                ? 'text-danger'
                : 'text-text-muted group-focus-within:text-brand'
            }`}
          />
        </div>
        <input
          id={`register-${name}`}
          type={type}
          name={name}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          className={`w-full bg-bg-surface/60 border text-text-primary rounded-xl pl-11 pr-4 py-3 
            focus:outline-none focus:ring-2 transition-all duration-200
            placeholder:text-text-muted shadow-inner backdrop-blur-sm
            ${
              error
                ? 'border-danger/60 focus:ring-danger/40 focus:border-danger'
                : 'border-border-custom/50 focus:ring-brand/40 focus:border-brand'
            }`}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="text-danger text-xs mt-1 flex items-center gap-1 animate-fade-in">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-text-muted text-xs mt-1">{hint}</p>
      )}
    </div>
  );
};
