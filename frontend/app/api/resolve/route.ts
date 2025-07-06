import { NextRequest, NextResponse } from "next/server";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
  throw new Error(
    "Missing Privy environment variables. Please set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET."
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Missing email in request body" },
        { status: 400 }
      );
    }

    // Request user by email via Privy REST API
    const privyResponse = await fetch(
      "https://auth.privy.io/api/v1/users/email/address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "privy-app-id": PRIVY_APP_ID,
          Authorization: `Basic ${Buffer.from(
            `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`
          ).toString("base64")}`,
        },
        // API expects { address: email }
        body: JSON.stringify({ address: email }),
      }
    );

    if (!privyResponse.ok) {
      const text = await privyResponse.text();
      return NextResponse.json(
        { error: `Privy API error: ${text}` },
        { status: privyResponse.status }
      );
    }

    const userData = await privyResponse.json();
    console.log(userData);

    // Attempt to find a wallet address in returned user data
    // The exact shape of the response is documented by Privy. We look in linked_accounts for type "wallet"
    const linkedAccounts = userData?.user?.linked_accounts || [];
    let walletAddress: string | undefined;
    for (const acct of linkedAccounts) {
      if (acct.type === "wallet" && acct.address) {
        walletAddress = acct.address;
        break;
      }
    }

    // Fallback: embedded wallet in user.wallet.address
    if (!walletAddress) {
      walletAddress = userData?.user?.wallet?.address;
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address not found for provided email" },
        { status: 404 }
      );
    }

    return NextResponse.json({ walletAddress }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
