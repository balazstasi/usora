"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Check,
  Mail,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format, addWeeks, addMonths } from "date-fns";
import type { Step1Data, Step2Data } from "@/types";
import ContractWrite from "./contract-write";
import { erc20Abi } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";

interface WizardStep3Props {
  step1Data: Step1Data;
  step2Data: Step2Data;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing?: boolean;
  isTransitioning: boolean;
}

export function WizardStep3({
  step1Data,
  step2Data,
  onConfirm,
  onBack,
  isProcessing,
  isTransitioning,
}: WizardStep3Props) {
  const [showSchedule, setShowSchedule] = useState(false);

  const installmentAmount =
    Number.parseFloat(step1Data.totalAmount) / step2Data.numberOfInstallments;

  // Generate payment dates
  const generatePaymentDates = () => {
    const dates = [];
    let currentDate = step2Data.startDate!;

    for (let i = 0; i < step2Data.numberOfInstallments; i++) {
      dates.push(new Date(currentDate));
      if (step2Data.frequency === "weekly") {
        currentDate = addWeeks(currentDate, 1);
      } else {
        currentDate = addMonths(currentDate, 1);
      }
    }
    return dates;
  };

  const paymentDates = step2Data.startDate ? generatePaymentDates() : [];

  useEffect(() => {
    // Show schedule with delay for better UX
    const timer = setTimeout(() => {
      setShowSchedule(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    if (isProcessing) return;

    const button = document.activeElement as HTMLElement;
    button?.classList.add("btn-press");

    setTimeout(() => {
      button?.classList.remove("btn-press");
      onConfirm();
    }, 150);
  };

  const handleBack = () => {
    const button = document.activeElement as HTMLElement;
    button?.classList.add("btn-press");

    setTimeout(() => {
      button?.classList.remove("btn-press");
      onBack();
    }, 150);
  };

  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({ address });
  const result = useReadContract({
    address,
    abi: erc20Abi,
    functionName: "balanceOf",
  });

  console.log({ result });

  return (
    <div className="px-4 space-y-6">
      <Card className="interactive-hover">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Check className="h-5 w-5" />
            Confirm Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge
                variant={step1Data.isLendingMode ? "default" : "secondary"}
              >
                {step1Data.isLendingMode ? "Lending" : "Scheduled Payments"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Recipient
              </span>
              <span className="font-medium">{step1Data.recipientEmail}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Total Amount
              </span>
              <span className="font-bold text-lg">
                ${step1Data.totalAmount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Installments
              </span>
              <span className="font-medium">
                {step2Data.numberOfInstallments} × $
                {installmentAmount.toFixed(2)} ({step2Data.frequency})
              </span>
            </div>
          </div>

          <Separator />

          {/* Payment Schedule */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {step1Data.isLendingMode
                ? "Repayment Schedule"
                : "Payment Schedule"}
            </h4>
            <div
              className={`space-y-2 max-h-48 overflow-y-auto ${
                showSchedule ? "content-reveal" : "opacity-0"
              }`}
            >
              {paymentDates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg interactive-hover smooth-transition"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <p className="font-medium">Payment #{index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(date, "MMM dd, yyyy")}
                    </p>
                  </div>
                  <span className="font-medium">
                    ${installmentAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-800">Important Notice</p>
                <p className="text-amber-700 mt-1">
                  {step1Data.isLendingMode
                    ? "This will create a lending agreement. Make sure you trust the recipient and have clear repayment terms."
                    : "This will schedule multiple payments. Ensure you have sufficient funds for each payment date."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isProcessing || isTransitioning}
          className="flex-1 h-12 bg-transparent interactive-hover smooth-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <ContractWrite value={step1Data.totalAmount} />
      </div>
    </div>
  );
}
