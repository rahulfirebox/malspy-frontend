


const CreateOrder = async (amount: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/create-order`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
    return response.json();
}

const cancelOrder = async (orderId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/cancel-order`, {
        method: 'POST',
        body: JSON.stringify({ orderId }),
    });
    return response.json();
}

const billingInvoice = async (orderId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/billing-invoice`, {
        method: 'GET',
        body: JSON.stringify({ orderId }),
    });
    return response.json();
}