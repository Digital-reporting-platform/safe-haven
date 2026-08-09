export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  // Standard email regex - more comprehensive
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  
  // Additional validation for common mistakes
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.includes('..') || normalizedEmail.includes('.@') || normalizedEmail.includes('@.')) {
    return 'Please enter a valid email address';
  }
  
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
  if (name.trim().length > 50) return `${label} must not exceed 50 characters`;
  
  // Allow international characters, letters, spaces, hyphens, and apostrophes
  if (!/^[\p{L}\s'-]+$/u.test(name.trim())) {
    return `${label} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  // Check for multiple consecutive spaces or special characters
  if (/\s{2,}/.test(name.trim()) || /-{2,}/.test(name.trim()) || /'{2,}/.test(name.trim())) {
    return `${label} contains invalid character sequences`;
  }
  
  return undefined;
};

export const validatePhone = (phone: string, required: boolean = false): string | undefined => {
  if (!phone.trim()) {
    return required ? 'Phone number is required' : undefined;
  }
  
  const normalized = phone.trim().replace(/[\s\-\(\)]/g, '');
  
  // International phone number validation (more flexible)
  // Supports: +251911234567, +251 911 234 567, 0911234567, 251911234567
  const internationalRegex = /^(\+?[1-9]\d{6,14})$/;
  
  // Ethiopian specific formats (optional, can be used for local validation)
  const ethiopianRegex = /^(\+251[79]\d{8}|0[79]\d{8}|251[79]\d{8})$/;
  
  // First try Ethiopian format, then fall back to international
  if (ethiopianRegex.test(normalized)) {
    return undefined;
  }
  
  if (internationalRegex.test(normalized)) {
    // Additional validation for reasonable length
    if (normalized.length < 7 || normalized.length > 15) {
      return 'Phone number must be between 7 and 15 digits';
    }
    return undefined;
  }
  
  return 'Please enter a valid phone number (e.g., +251911234567 or 0911234567)';
};

export const validateAge = (age: string): string | undefined => {
  if (!age.trim()) return 'Age is required';
  
  const ageNum = parseInt(age.trim(), 10);
  
  if (isNaN(ageNum)) return 'Please enter a valid age';
  if (ageNum < 0) return 'Age cannot be negative';
  if (ageNum < 1) return 'Age must be at least 1';
  if (ageNum > 120) return 'Please enter a valid age (maximum 120)';
  
  return undefined;
};

export const validateLocation = (location: string): string | undefined => {
  if (!location.trim()) return 'Location is required';
  if (location.trim().length < 3) return 'Location must be at least 3 characters';
  if (location.trim().length > 200) return 'Location must not exceed 200 characters';
  
  // Allow letters, numbers, spaces, commas, periods, and common address characters
  if (!/^[\p{L}\d\s\.,\-#/]+$/u.test(location.trim())) {
    return 'Location contains invalid characters';
  }
  
  return undefined;
};

export const validateDescription = (description: string, minLength: number = 20, maxLength: number = 5000): string | undefined => {
  if (!description.trim()) return 'Description is required';
  if (description.trim().length < minLength) return `Description must be at least ${minLength} characters`;
  if (description.trim().length > maxLength) return `Description must not exceed ${maxLength} characters`;
  return undefined;
};

export const validateDate = (date: string, label: string = 'Date'): string | undefined => {
  if (!date) return `${label} is required`;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Please enter a valid date';
  
  const now = new Date();
  if (dateObj > now) return `${label} cannot be in the future`;
  
  return undefined;
};

export const validateRequired = (value: string, label: string): string | undefined => {
  if (!value || !value.trim()) return `${label} is required`;
  if (value.trim().length < 2) return `${label} must be at least 2 characters`;
  return undefined;
};
