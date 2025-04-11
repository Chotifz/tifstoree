import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
    })

export async function POST(request ) {
    const {orderNumber, productName, price, quantity, gameData, email} = await request.json()
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
    }

    const token = await snap.createTransactionToken(parameter)
    console.log(token
    )
    return NextResponse.json(token)
}
