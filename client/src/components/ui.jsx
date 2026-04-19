import { forwardRef, useState } from 'react';
import { ArrowUpDown, Check, Loader2, X } from 'lucide-react';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const panelClassName =
  'bg-white p-6 rounded-xl shadow-sm border border-slate-100';
export const fieldClassName =
  'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all';
export const textareaClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y transition-all';

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, type, children, ...props },
  ref
) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      ref={ref}
      type={type || 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export const Input = forwardRef(function Input(
  { className, label, error, id, value, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        value={value ?? ''}
        className={cn(fieldClassName, error && 'border-red-500 focus:ring-red-500', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export function TagInput({ label, tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim();

    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  }

  function removeTag(tagToRemove) {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function SaveStatus({ status }) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium transition-all">
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          <span className="text-slate-500">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === 'error' && <span className="text-red-600">Error saving</span>}
    </div>
  );
}

export function SectionToggle({ order, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2">
        Prioritize:
      </span>
      <button
        onClick={() => onChange('experience')}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
          order === 'experience'
            ? 'bg-indigo-100 text-indigo-700 shadow-sm'
            : 'text-slate-600 hover:bg-slate-50'
        )}
      >
        Experience
      </button>
      <ArrowUpDown className="h-4 w-4 text-slate-400" />
      <button
        onClick={() => onChange('education')}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
          order === 'education'
            ? 'bg-indigo-100 text-indigo-700 shadow-sm'
            : 'text-slate-600 hover:bg-slate-50'
        )}
      >
        Education
      </button>
    </div>
  );
}
