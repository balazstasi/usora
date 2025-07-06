import type { WizardConfig, WizardStep, TransactionData, Step1Data, Step2Data } from "@/types/wizard"
import { addWeeks, addMonths } from "date-fns"

export function createWizardConfig(currentStepIndex = 0): WizardConfig {
  const steps: WizardStep[] = [
    {
      id: 1,
      title: "Details",
      description: "Email & Amount",
      isComplete: false,
      isActive: currentStepIndex === 0,
      canProceed: false,
    },
    {
      id: 2,
      title: "Schedule",
      description: "Installments",
      isComplete: false,
      isActive: currentStepIndex === 1,
      canProceed: false,
    },
    {
      id: 3,
      title: "Confirm",
      description: "Review & Send",
      isComplete: false,
      isActive: currentStepIndex === 2,
      canProceed: false,
    },
  ]

  // Mark previous steps as complete
  for (let i = 0; i < currentStepIndex; i++) {
    steps[i].isComplete = true
    steps[i].isActive = false
    steps[i].canProceed = true
  }

  return {
    steps,
    currentStepIndex,
    totalSteps: steps.length,
  }
}

export function generateInstallments(step1Data: Step1Data, step2Data: Step2Data) {
  const installments = []
  const installmentAmount = Number.parseFloat(step1Data.totalAmount) / step2Data.numberOfInstallments
  let currentDate = step2Data.startDate!

  for (let i = 0; i < step2Data.numberOfInstallments; i++) {
    installments.push({
      id: `${Date.now()}_${i}`,
      amount: installmentAmount,
      date: new Date(currentDate),
      status: "pending" as const,
    })

    // Calculate next date based on frequency
    if (step2Data.frequency === "weekly") {
      currentDate = addWeeks(currentDate, 1)
    } else {
      currentDate = addMonths(currentDate, 1)
    }
  }

  return installments
}

export function createTransactionData(step1Data: Step1Data, step2Data: Step2Data): TransactionData {
  return {
    mode: step1Data.isLendingMode ? "lending" : "scheduled_payments",
    recipientEmail: step1Data.recipientEmail,
    totalAmount: Number.parseFloat(step1Data.totalAmount),
    installments: generateInstallments(step1Data, step2Data),
  }
}

export function updateWizardConfig(config: WizardConfig, stepIndex: number, canProceed: boolean): WizardConfig {
  const newSteps = config.steps.map((step, index) => ({
    ...step,
    isActive: index === stepIndex,
    canProceed: index === stepIndex ? canProceed : step.canProceed,
    isComplete: index < stepIndex,
  }))

  return {
    ...config,
    steps: newSteps,
    currentStepIndex: stepIndex,
  }
}
