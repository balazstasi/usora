import type React from "react"
// Core wizard types
export interface WizardStep {
  id: number
  title: string
  description: string
  isComplete: boolean
  isActive: boolean
  canProceed: boolean
}

export interface WizardConfig {
  steps: WizardStep[]
  currentStepIndex: number
  totalSteps: number
}

// Step data types
export interface Step1Data {
  recipientEmail: string
  totalAmount: string
  isLendingMode: boolean
}

export interface Step2Data {
  numberOfInstallments: number
  startDate: Date | undefined
  frequency: "weekly" | "monthly"
}

export interface Step3Data {
  confirmationChecked: boolean
  termsAccepted: boolean
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

export interface StepValidation {
  step1: ValidationResult
  step2: ValidationResult
  step3: ValidationResult
}

// API types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TransactionData {
  mode: "lending" | "scheduled_payments"
  recipientEmail: string
  totalAmount: number
  installments: Installment[]
}

export interface Installment {
  id: string
  amount: number
  date: Date
  status?: "pending" | "paid" | "overdue"
}

// Component prop types
export interface WizardProgressProps {
  config: WizardConfig
  className?: string
}

export interface WizardStepProps<T = any> {
  data: T
  onDataChange: (data: T) => void
  onValidationChange: (validation: ValidationResult) => void
  validation: ValidationResult
  isLoading?: boolean
  className?: string
}

export interface ContinueButtonProps {
  isEnabled: boolean
  isLoading: boolean
  onContinue: () => Promise<void> | void
  onValidate?: () => Promise<ValidationResult> | ValidationResult
  children: React.ReactNode
  className?: string
}

export interface WizardContainerProps {
  initialData?: {
    step1?: Partial<Step1Data>
    step2?: Partial<Step2Data>
    step3?: Partial<Step3Data>
  }
  onComplete: (data: TransactionData) => Promise<ApiResponse>
  onStepChange?: (stepIndex: number, stepData: any) => void
  className?: string
}

// Server component props
export interface WizardServerProps {
  userId?: string
  transactionId?: string
  mode?: "create" | "edit"
}

// API service types
export interface WizardApiService {
  validateStep: <T>(stepIndex: number, data: T) => Promise<ValidationResult>
  saveProgress: (stepIndex: number, data: any) => Promise<ApiResponse>
  loadProgress: (transactionId?: string) => Promise<ApiResponse<any>>
  submitTransaction: (data: TransactionData) => Promise<ApiResponse>
  getConfiguration: () => Promise<ApiResponse<WizardConfig>>
}
