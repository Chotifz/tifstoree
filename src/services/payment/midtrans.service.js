import Midtrans from 'midtrans-client';

let snap = new Midtrans.Snap({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY
});

if (process.env.MIDTRANS_SANDBOX === 'true') {
  snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
  });
}
export async function createSnapToken({
  orderNumber,
  productName,
  price,
  quantity = 1,
  gameData,
  email
}) {
  try {
    let parameter = {
      item_details: {
        name: productName,
        price: price,
        quantity: quantity
      },
      transaction_details: {
        order_id: orderNumber,
        gross_amount: price * quantity
      },
      ...(email || gameData?.username
        ? {
            customer_details: {
              ...(gameData?.username && { first_name: gameData.username }),
              ...(email && { email }),
            },
          }
        : {}),
    };

    const token = await snap.createTransactionToken(parameter);
    
    return token;
  } catch (error) {
    console.error('Error creating Midtrans token:', error);
    throw new Error('Failed to create payment token');
  }
}

export function getMidtransClientKey() {
  return process.env.MIDTRANS_CLIENT_KEY;
}

export function isMidtransSandbox() {
  return process.env.MIDTRANS_SANDBOX === 'true';
}