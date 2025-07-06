"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import type { Step1Data } from "@/types";
import Balance from "./balance";

interface WizardStep1Props {
  data: Step1Data;
  onDataChange: (data: Step1Data) => void;
  onNext: () => void;
  isTransitioning: boolean;
}

export function WizardStep1({
  data,
  onDataChange,
  onNext,
  isTransitioning,
}: WizardStep1Props) {
  const [validationState, setValidationState] = useState<{
    email: "valid" | "invalid" | "neutral";
    amount: "valid" | "invalid" | "neutral";
  }>({
    email: "neutral",
    amount: "neutral",
  });

  const canProceed =
    data.recipientEmail.trim() !== "" &&
    data.totalAmount.trim() !== "" &&
    !isNaN(Number.parseFloat(data.totalAmount)) &&
    Number.parseFloat(data.totalAmount) > 0;

  const handleEmailChange = (value: string) => {
    onDataChange({ ...data, recipientEmail: value });

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.trim() === "") {
      setValidationState((prev) => ({ ...prev, email: "neutral" }));
    } else if (emailRegex.test(value)) {
      setValidationState((prev) => ({ ...prev, email: "valid" }));
    } else {
      setValidationState((prev) => ({ ...prev, email: "invalid" }));
    }
  };

  const handleAmountChange = (value: string) => {
    onDataChange({ ...data, totalAmount: value });

    const amount = Number.parseFloat(value);
    if (value.trim() === "") {
      setValidationState((prev) => ({ ...prev, amount: "neutral" }));
    } else if (!isNaN(amount) && amount > 0) {
      setValidationState((prev) => ({ ...prev, amount: "valid" }));
    } else {
      setValidationState((prev) => ({ ...prev, amount: "invalid" }));
    }
  };

  const handleNext = () => {
    if (!canProceed) return;

    // Add button press animation
    const button = document.activeElement as HTMLElement;
    button?.classList.add("btn-press");

    setTimeout(() => {
      button?.classList.remove("btn-press");
      onNext();
    }, 150);
  };

  return (
    <div className="px-4 space-y-6">
      <Card className="interactive-hover">
        <CardHeader>
          <CardTitle className="text-xl">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Transaction Type</Label>
            <div className="flex items-center justify-between p-4 border rounded-lg interactive-hover smooth-transition">
              <div>
                <p className="font-medium">
                  {data.isLendingMode ? "Lending Money" : "Scheduled Payments"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.isLendingMode
                    ? "You'll lend money and receive it back in installments"
                    : "You'll send money in multiple installments over time"}
                </p>
              </div>
              <Switch
                checked={data.isLendingMode}
                onCheckedChange={(checked) =>
                  onDataChange({ ...data, isLendingMode: checked })
                }
                className="smooth-transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Recipient Email / Wallet ID
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground smooth-transition" />
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                className={`pl-10 h-12 text-base focus-ring smooth-transition ${
                  validationState.email === "valid"
                    ? "input-valid border-green-500"
                    : validationState.email === "invalid"
                    ? "input-invalid border-red-500"
                    : ""
                }`}
                value={data.recipientEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              {data.isLendingMode ? "Amount to Lend" : "Total Amount"}
            </Label>
            <Balance />
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground smooth-transition" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`pl-10 h-12 text-base focus-ring smooth-transition ${
                  validationState.amount === "valid"
                    ? "input-valid border-green-500"
                    : validationState.amount === "invalid"
                    ? "input-invalid border-red-500"
                    : ""
                }`}
                value={data.totalAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          disabled
          className="flex-1 h-12 bg-transparent opacity-50 cursor-not-allowed"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || isTransitioning}
          className={`flex-1 h-12 smooth-transition ${
            canProceed && !isTransitioning ? "interactive-hover" : ""
          }`}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
