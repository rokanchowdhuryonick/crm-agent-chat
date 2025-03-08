// src/utils/toast.ts
import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  info: (message: string) => {
    toast(message, {
      icon: '📣',
    });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  custom: (message: string, icon: string) => {
    toast(message, {
      icon,
    });
  },
};