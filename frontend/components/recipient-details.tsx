"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Mail } from "lucide-react";
import type { RecipientDetailsProps } from "@/types";

export function RecipientDetails({
  recipientEmail,
  totalAmount,
  isLendingMode,
  onEmailChange,
  onAmountChange,
}: RecipientDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Recipient Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Recipient Email / Wallet ID</Label>
          <Input
            id="email"
            type="email"
            placeholder="recipient@example.com"
            value={recipientEmail}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">
            {isLendingMode ? "Lending Amount" : "Total Amount to Send"}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="pl-10"
              value={totalAmount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
