export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  // Standard email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  
  // Complexity check: uppercase, lowercase, and number
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return undefined;
};

export const validateName = (name: string, label: string): string | undefined => {
  if (!name.trim()) return `${label} is required`;
  if (name.trim().length < 2) return `${label} must be at least 2 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return `${label} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  return undefined;
};

export const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) return undefined; // Optional by default in my context
  
  const normalized = phone.trim().replace(/\s+/g, '');
  
  // Ethiopian Phone Formats:
  // 1. +251 9XX XXX XXX (13 chars with +)
  // 2. 09XX XXX XXX (10 digits)
  // 3. 07XX XXX XXX (10 digits)
  
  const ethiopianRegex = /^(\+251[79]\d{8}|0[79]\d{8})$/;
  
  if (!ethiopianRegex.test(normalized)) {
    return 'Please enter a valid Ethiopian phone number (e.g., +2519... or 09...)';
  }
  return undefined;
};
