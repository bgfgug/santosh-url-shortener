export const parseApiError = (err: any): string[] => {
  const defaultMsg = "An unexpected error occurred. Please try again.";
  
  if (!err || !err.response) {
    return ["Unable to connect to the server. Please check your internet connection."];
  }

  const { data } = err.response;

  // Handle System Errors
  if (data?.type === 'system_error') {
    return [data.message || "A system-wide error occurred."];
  }

  // Handle Application Errors (Validation, logic)
  if (data?.type === 'application_error') {
    const appErrors = data.errors;
    
    if (!appErrors) return [defaultMsg];

    // 1. Check for 'detail' (common in 401/403/404)
    if (appErrors.detail && typeof appErrors.detail === 'string') {
        return [appErrors.detail];
    }

    // 2. Check for 'non_field_errors'
    if (appErrors.non_field_errors) {
       const nfe = appErrors.non_field_errors;
       return Array.isArray(nfe) ? nfe : [String(nfe)];
    }

    // 3. Map through all field errors
    const errors: string[] = [];
    for (const key in appErrors) {
      if (key === 'status_code' || key === 'type') continue;
      
      const value = appErrors[key];
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      
      if (Array.isArray(value)) {
        errors.push(`${label}: ${value.join(' ')}`);
      } else if (typeof value === 'string') {
        errors.push(`${label}: ${value}`);
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested error objects recursively if needed, 
        // but for now just stringify as a fallback
        errors.push(`${label}: ${JSON.stringify(value)}`);
      }
    }
    
    return errors.length > 0 ? errors : [defaultMsg];
  }

  // Standard fallback for unexpected formats
  return [data?.detail || data?.message || defaultMsg];
};

/**
 * Extracts specific field errors for inline form validation.
 */
export const getFieldErrors = (err: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (err?.response?.data?.type === 'application_error') {
    const errors = err.response.data.errors;
    if (errors && typeof errors === 'object') {
      for (const key in errors) {
        if (key !== 'non_field_errors' && key !== 'detail' && key !== 'status_code' && key !== 'type') {
          const val = errors[key];
          if (Array.isArray(val) && val.length > 0) {
            fieldErrors[key] = val[0];
          } else if (typeof val === 'string') {
            fieldErrors[key] = val;
          }
        }
      }
    }
  }
  return fieldErrors;
};

export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) return "Email is required.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim()) ? null : "Please enter a valid email address.";
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters long.";
  return null;
};