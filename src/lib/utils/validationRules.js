/**
 * Frontend Validation Utility
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const mobileRegex = /^\+?[0-9\s-]{8,15}$/;
// Simple URL regex matching http:// or https://
export const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validateMobile = (mobile) => {
  if (!mobile) return "Mobile number is required";
  if (!mobileRegex.test(mobile)) return "Please enter a valid mobile number";
  return "";
};

export const validateUrl = (url, fieldName = "URL") => {
  if (!url) return ""; // Optional URLs should pass if empty
  if (!urlRegex.test(url)) return `Please enter a valid ${fieldName}`;
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must contain minimum 8 characters";
  return "";
};

export const requiredMessage = (field) => `${field} is required`;
export const dropdownMessage = (field) => `Please select ${field.toLowerCase()}`;
export const imageRequiredMessage = "Please upload image";
export const videoRequiredMessage = "Please upload video";
export const pdfRequiredMessage = "Please upload PDF file";
export const sequenceRequiredMessage = "Sequence is required";
export const sequenceInvalidMessage = "Sequence must be a number";
export const valueRequiredMessage = "Value is required";
