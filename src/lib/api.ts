// Minimal API client for PaymentModal component
export const apiClient = {
	processPayment: async (paymentData: any) => {
		// Simulate API call
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ message: 'Payment processed successfully!' });
			}, 1000);
		});
	}
};

