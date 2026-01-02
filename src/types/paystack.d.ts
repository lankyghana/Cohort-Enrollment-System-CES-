interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: {
    course_id: string;
    student_id: string;
  };
  onClose?: () => void;
  callback?: (response: { reference: string }) => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup(options: PaystackOptions): {
        openIframe(): void;
      };
    };
  }
}

export {};
