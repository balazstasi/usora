"use client"

import { useState, useCallback, useEffect } from "react"
import { WizardProgress } from "./wizard-progress"
import { WizardStep1 } from "./wizard-step1"
import { WizardStep2 } from "./wizard-step2"
import { WizardStep3 } from "./wizard-step3"
import { wizardService } from "@/lib/api/wizard-service"
import { createWizardConfig, updateWizardConfig, createTransactionData } from "@/lib/utils/wizard-helpers"
import type {
  WizardContainerProps,
  WizardConfig,
  Step1Data,
  Step2Data,
  Step3Data,
  ValidationResult,
  StepValidation,
} from "@/types/wizard"

const initialStep1Data: Step1Data = {
  recipientEmail: "",
  totalAmount: "",
  isLendingMode: true,
}

const initialStep2Data: Step2Data = {
  numberOfInstallments: 3,
  startDate: undefined,
  frequency: "monthly",
}

const initialStep3Data: Step3Data = {
  confirmationChecked: false,
  termsAccepted: false,
}

const initialValidation: StepValidation = {
  step1: { isValid: false, errors: {}, warnings: {} },
  step2: { isValid: false, errors: {}, warnings: {} },
  step3: { isValid: false, errors: {}, warnings: {} },
}

export function WizardContainer({ initialData, onComplete, onStepChange, className }: WizardContainerProps) {
  const [config, setConfig] = useState<WizardConfig>(() => createWizardConfig(0))
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Step data
  const [step1Data, setStep1Data] = useState<Step1Data>({
    ...initialStep1Data,
    ...initialData?.step1,
  })
  const [step2Data, setStep2Data] = useState<Step2Data>({
    ...initialStep2Data,
    ...initialData?.step2,
  })
  const [step3Data, setStep3Data] = useState<Step3Data>({
    ...initialStep3Data,
    ...initialData?.step3,
  })

  // Validation state
  const [validation, setValidation] = useState<StepValidation>(initialValidation)

  // Load initial configuration and data
  useEffect(() => {
    loadWizardData()
  }, [])

  const loadWizardData = async () => {
    setIsLoading(true)
    try {
      const [configResult, progressResult] = await Promise.all([
        wizardService.getConfiguration(),
        wizardService.loadProgress(),
      ])

      if (configResult.success && configResult.data) {
        setConfig(configResult.data)
      }

      if (progressResult.success && progressResult.data) {
        const { step1, step2, step3, currentStep } = progressResult.data
        if (step1) setStep1Data({ ...step1Data, ...step1 })
        if (step2) setStep2Data({ ...step2Data, ...step2 })
        if (step3) setStep3Data({ ...step3Data, ...step3 })
        if (typeof currentStep === "number") {
          setConfig((prev) => createWizardConfig(currentStep))
        }
      }
    } catch (error) {
      console.error("Failed to load wizard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateCurrentStep = useCallback(async (): Promise<ValidationResult> => {
    const currentStep = config.currentStepIndex

    let result: ValidationResult
    switch (currentStep) {
      case 0:
        result = wizardService.validateStep1(step1Data)
        setValidation((prev) => ({ ...prev, step1: result }))
        break
      case 1:
        result = wizardService.validateStep2(step2Data)
        setValidation((prev) => ({ ...prev, step2: result }))
        break
      case 2:
        result = wizardService.validateStep3(step3Data)
        setValidation((prev) => ({ ...prev, step3: result }))
        break
      default:
        result = { isValid: false, errors: {}, warnings: {} }
    }

    // Update config with validation result
    setConfig((prev) => updateWizardConfig(prev, currentStep, result.isValid))

    return result
  }, [config.currentStepIndex, step1Data, step2Data, step3Data])

  const saveProgress = async (stepIndex: number, data: any) => {
    try {
      await wizardService.saveProgress(stepIndex, data)
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }

  const handleStepChange = useCallback(
    (newStepIndex: number, stepData: any) => {
      onStepChange?.(newStepIndex, stepData)
      saveProgress(newStepIndex, stepData)
    },
    [onStepChange],
  )

  const handleNext = async () => {
    const validationResult = await validateCurrentStep()

    if (!validationResult.isValid) {
      return
    }

    const currentStep = config.currentStepIndex
    const nextStep = currentStep + 1

    if (nextStep < config.totalSteps) {
      setIsTransitioning(true)

      // Save current step data
      const currentData = getCurrentStepData()
      handleStepChange(currentStep, currentData)

      setTimeout(() => {
        setConfig((prev) => createWizardConfig(nextStep))
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleBack = () => {
    const currentStep = config.currentStepIndex
    const prevStep = currentStep - 1

    if (prevStep >= 0) {
      setIsTransitioning(true)

      setTimeout(() => {
        setConfig((prev) => createWizardConfig(prevStep))
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleComplete = async () => {
    const validationResult = await validateCurrentStep()

    if (!validationResult.isValid) {
      return
    }

    setIsLoading(true)
    try {
      const transactionData = createTransactionData(step1Data, step2Data)
      const result = await onComplete(transactionData)

      if (result.success) {
        // Handle success (could navigate to success page, show confirmation, etc.)
        console.log("Transaction completed successfully:", result)
      } else {
        console.error("Transaction failed:", result.error)
      }
    } catch (error) {
      console.error("Failed to complete transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentStepData = () => {
    switch (config.currentStepIndex) {
      case 0:
        return step1Data
      case 1:
        return step2Data
      case 2:
        return step3Data
      default:
        return null
    }
  }

  const getCurrentValidation = (): ValidationResult => {
    switch (config.currentStepIndex) {
      case 0:
        return validation.step1
      case 1:
        return validation.step2
      case 2:
        return validation.step3
      default:
        return { isValid: false, errors: {}, warnings: {} }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <WizardProgress config={config} />

      <div className={`transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        {config.currentStepIndex === 0 && (
          <WizardStep1
            data={step1Data}
            onDataChange={setStep1Data}
            onValidationChange={(result) => setValidation((prev) => ({ ...prev, step1: result }))}
            validation={getCurrentValidation()}
            isLoading={isLoading}
            onContinue={handleNext}
            onValidate={validateCurrentStep}
          />
        )}

        {config.currentStepIndex === 1 && (
          <WizardStep2
            data={step2Data}
            onDataChange={setStep2Data}
            onValidationChange={(result) => setValidation((prev) => ({ ...prev, step2: result }))}
            validation={getCurrentValidation()}
            isLoading={isLoading}
            onContinue={handleNext}
            onBack={handleBack}
            onValidate={validateCurrentStep}
            step1Data={step1Data}
          />
        )}

        {config.currentStepIndex === 2 && (
          <WizardStep3
            data={step3Data}
            onDataChange={setStep3Data}
            onValidationChange={(result) => setValidation((prev) => ({ ...prev, step3: result }))}
            validation={getCurrentValidation()}
            isLoading={isLoading}
            onComplete={handleComplete}
            onBack={handleBack}
            onValidate={validateCurrentStep}
            step1Data={step1Data}
            step2Data={step2Data}
          />
        )}
      </div>
    </div>
  )
}
