import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
    })

export async function POST(request ) {
    const {id, productName, price, quantity} = await request.json()
    let parameter = {
        item_details: {
            name: productName,
            price: price,
            quantity: quantity  
        },
        transaction_details: {
            order_id: id,
            gross_amount: price * quantity
        },
    }

    const token = await snap.createTransactionToken(parameter)
    console.log(token
    )
    return NextResponse.json(token)
}

// const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
// const MIDTRANS_API_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

// export async function POST(req) {
//   try {
//     const { order_id, gross_amount, customer_details, item_details } =
//       await req.json();

//     const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

//     const response = await axios.post(
//       MIDTRANS_API_URL,
//       {
//         transaction_details: { order_id, gross_amount },
//         customer_details,
//         item_details,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Basic ${auth}`,
//         },
//       }
//     );

//     return NextResponse.json(response.data);
//   } catch (error) {
//     return NextResponse.json(
//       { error: error.response?.data || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
