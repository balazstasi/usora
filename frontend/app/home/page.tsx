"use client";

import { useState, useEffect } from "react";
import { TransactionService } from "@/services/api";
import { MobileHeader } from "@/components/mobile-header";
import { WizardProgress } from "@/components/wizard-progress";
import { WizardStep1 } from "@/components/wizard-step1";
import { WizardStep2 } from "@/components/wizard-step2";
import { WizardStep3 } from "@/components/wizard-step3";
import { MobileTracking } from "@/components/mobile-tracking";
import type {
  Step1Data,
  Step2Data,
  TrackedTransaction,
  WizardStep,
  TransactionData,
} from "@/types";

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: "Details", description: "Email & Amount" },
  { id: 2, title: "Schedule", description: "Installments" },
  { id: 3, title: "Confirm", description: "Review & Send" },
];

export default function CryptoLendingApp() {
  const [currentPage, setCurrentPage] = useState<
    "form" | "tracking" | "dashboard"
  >("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [trackedTransactions, setTrackedTransactions] = useState<
    TrackedTransaction[]
  >([]);

  // Form data
  const [step1Data, setStep1Data] = useState<Step1Data>({
    recipientEmail: "",
    totalAmount: "",
    isLendingMode: true,
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    numberOfInstallments: 3,
    startDate: undefined,
    frequency: "monthly",
  });

  // Load tracked transactions when switching to tracking page
  useEffect(() => {
    if (currentPage === "tracking") {
      loadTrackedTransactions();
    }
  }, [currentPage]);

  const loadTrackedTransactions = async () => {
    try {
      const result = await TransactionService.getTrackedTransactions();
      if (result.success && result.transactions) {
        setTrackedTransactions(result.transactions);
      }
    } catch (error) {
      console.error("Failed to load tracked transactions:", error);
    }
  };

  const handlePageChange = (page: "form" | "tracking" | "dashboard") => {
    setCurrentPage(page);
    if (page === "form") {
      setCurrentStep(0);
      setPreviousStep(0);
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setIsTransitioning(true);
      setPreviousStep(currentStep);

      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setPreviousStep(currentStep);

      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      // Generate installments based on step2 data
      const installments = [];
      const installmentAmount =
        Number.parseFloat(step1Data.totalAmount) /
        step2Data.numberOfInstallments;
      let currentDate = step2Data.startDate!;

      for (let i = 0; i < step2Data.numberOfInstallments; i++) {
        installments.push({
          id: `${Date.now()}_${i}`,
          amount: installmentAmount,
          date: new Date(currentDate),
        });

        // Calculate next date based on frequency
        if (step2Data.frequency === "weekly") {
          currentDate = new Date(
            currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
          );
        } else {
          currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            currentDate.getDate()
          );
        }
      }

      const transactionData: TransactionData = {
        mode: step1Data.isLendingMode ? "lending" : "scheduled_payments",
        recipientEmail: step1Data.recipientEmail,
        totalAmount: Number.parseFloat(step1Data.totalAmount),
        installments,
      };

      let result;
      if (transactionData.mode === "lending") {
        result = await TransactionService.createLendingRequest(transactionData);
      } else {
        result = await TransactionService.schedulePayments(transactionData);
      }

      if (result.success) {
        console.log("Transaction successful:", result);
        // Reset form and go to tracking
        setStep1Data({
          recipientEmail: "",
          totalAmount: "",
          isLendingMode: true,
        });
        setStep2Data({
          numberOfInstallments: 3,
          startDate: undefined,
          frequency: "monthly",
        });
        setCurrentStep(0);
        setPreviousStep(0);
        setCurrentPage("tracking");
        await loadTrackedTransactions();
      } else {
        console.error("Transaction failed:", result.error);
      }
    } catch (error) {
      console.error("Transaction error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader
        currentPage={currentPage}
        onPageChange={handlePageChange}
        showBack={false}
      />

      <div className="pb-6">
        {currentPage === "form" ? (
          <div className="space-y-0">
            <WizardProgress
              steps={WIZARD_STEPS}
              currentStep={currentStep}
              previousStep={previousStep}
            />

            <div className={`${isTransitioning ? "step-exit" : "step-enter"}`}>
              {currentStep === 0 && (
                <WizardStep1
                  data={step1Data}
                  onDataChange={setStep1Data}
                  onNext={handleNext}
                  isTransitioning={isTransitioning}
                />
              )}

              {currentStep === 1 && (
                <WizardStep2
                  step1Data={step1Data}
                  data={step2Data}
                  onDataChange={setStep2Data}
                  onNext={handleNext}
                  onBack={handleBack}
                  isTransitioning={isTransitioning}
                />
              )}

              {currentStep === 2 && (
                <WizardStep3
                  step1Data={step1Data}
                  step2Data={step2Data}
                  onConfirm={handleConfirm}
                  onBack={handleBack}
                  isProcessing={isProcessing}
                  isTransitioning={isTransitioning}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="step-enter">
            <MobileTracking
              transactions={trackedTransactions}
              onRefresh={loadTrackedTransactions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
