"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ContinueButton } from "./continue-button";
import { DollarSign, Mail, ArrowLeft } from "lucide-react";
import type {
  WizardStepProps,
  Step1Data,
  ValidationResult,
} from "@/types/wizard";

interface WizardStep1Props extends WizardStepProps<Step1Data> {
  onContinue: () => Promise<void>;
  onValidate: () => Promise<ValidationResult>;
}

export function WizardStep1({
  data,
  onDataChange,
  onValidationChange,
  validation,
  isLoading,
  onContinue,
  onValidate,
  className,
}: WizardStep1Props) {
  // Validate data whenever it changes
  useEffect(() => {
    const validateData = async () => {
      const result = await onValidate();
      onValidationChange(result);
    };

    validateData();
  }, [data, onValidate, onValidationChange]);

  const handleEmailChange = (value: string) => {
    onDataChange({ ...data, recipientEmail: value });
  };

  const handleAmountChange = (value: string) => {
    onDataChange({ ...data, totalAmount: value });
  };

  const handleModeChange = (isLendingMode: boolean) => {
    onDataChange({ ...data, isLendingMode });
  };

  return (
    <div className={`px-4 space-y-6 ${className || ""}`}>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Transaction Type</Label>
            <div className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:bg-gray-50">
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
                onCheckedChange={handleModeChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Recipient Email / Wallet ID
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                className={`pl-10 h-12 text-base transition-all duration-200 ${
                  validation.errors.recipientEmail
                    ? "border-red-500 focus:border-red-500"
                    : validation.isValid && data.recipientEmail
                    ? "border-green-500 focus:border-green-500"
                    : ""
                }`}
                value={data.recipientEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {validation.errors.recipientEmail && (
              <p className="text-sm text-red-600">
                {validation.errors.recipientEmail}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              {data.isLendingMode ? "Amount to Lend" : "Total Amount"}
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`pl-10 h-12 text-base transition-all duration-200 ${
                  validation.errors.totalAmount
                    ? "border-red-500 focus:border-red-500"
                    : validation.isValid && data.totalAmount
                    ? "border-green-500 focus:border-green-500"
                    : ""
                }`}
                value={data.totalAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {validation.errors.totalAmount && (
              <p className="text-sm text-red-600">
                {validation.errors.totalAmount}
              </p>
            )}
            {validation.warnings.totalAmount && (
              <p className="text-sm text-yellow-600">
                {validation.warnings.totalAmount}
              </p>
            )}
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
        <ContinueButton
          isEnabled={validation.isValid}
          isLoading={isLoading}
          onContinue={onContinue}
          onValidate={onValidate}
        >
          Continue
        </ContinueButton>
      </div>
    </div>
  );
}
