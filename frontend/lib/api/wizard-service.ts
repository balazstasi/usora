import type {
  WizardApiService,
  ValidationResult,
  ApiResponse,
  TransactionData,
  WizardConfig,
  Step1Data,
  Step2Data,
  Step3Data,
} from "@/types/wizard"

class WizardService implements WizardApiService {
  private baseUrl = "/api/wizard"

  async validateStep<T>(stepIndex: number, data: T): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIndex, data }),
      })

      if (!response.ok) {
        throw new Error("Validation failed")
      }

      return await response.json()
    } catch (error) {
      console.error("Validation error:", error)
      return {
        isValid: false,
        errors: { general: "Validation failed. Please try again." },
        warnings: {},
      }
    }
  }

  async saveProgress(stepIndex: number, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIndex, data }),
      })

      return await response.json()
    } catch (error) {
      console.error("Save progress error:", error)
      return {
        success: false,
        error: "Failed to save progress",
      }
    }
  }

  async loadProgress(transactionId?: string): Promise<ApiResponse<any>> {
    try {
      const url = transactionId ? `${this.baseUrl}/progress?transactionId=${transactionId}` : `${this.baseUrl}/progress`

      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      console.error("Load progress error:", error)
      return {
        success: false,
        error: "Failed to load progress",
      }
    }
  }

  async submitTransaction(data: TransactionData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error) {
      console.error("Submit transaction error:", error)
      return {
        success: false,
        error: "Failed to submit transaction",
      }
    }
  }

  async getConfiguration(): Promise<ApiResponse<WizardConfig>> {
    try {
      const response = await fetch(`${this.baseUrl}/config`)
      return await response.json()
    } catch (error) {
      console.error("Get configuration error:", error)
      return {
        success: false,
        error: "Failed to load configuration",
      }
    }
  }

  // Step-specific validation methods
  validateStep1(data: Step1Data): ValidationResult {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.recipientEmail.trim()) {
      errors.recipientEmail = "Email is required"
    } else if (!emailRegex.test(data.recipientEmail)) {
      errors.recipientEmail = "Please enter a valid email address"
    }

    // Amount validation
    const amount = Number.parseFloat(data.totalAmount)
    if (!data.totalAmount.trim()) {
      errors.totalAmount = "Amount is required"
    } else if (isNaN(amount) || amount <= 0) {
      errors.totalAmount = "Please enter a valid amount greater than 0"
    } else if (amount > 10000) {
      warnings.totalAmount = "Large amounts may require additional verification"
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    }
  }

  validateStep2(data: Step2Data): ValidationResult {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    // Installments validation
    if (data.numberOfInstallments < 1) {
      errors.numberOfInstallments = "At least 1 installment is required"
    } else if (data.numberOfInstallments > 12) {
      warnings.numberOfInstallments = "More than 12 installments may affect interest rates"
    }

    // Start date validation
    if (!data.startDate) {
      errors.startDate = "Start date is required"
    } else if (data.startDate < new Date()) {
      errors.startDate = "Start date cannot be in the past"
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    }
  }

  validateStep3(data: Step3Data): ValidationResult {
    const errors: Record<string, string> = {}

    if (!data.confirmationChecked) {
      errors.confirmation = "Please confirm the transaction details"
    }

    if (!data.termsAccepted) {
      errors.terms = "Please accept the terms and conditions"
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings: {},
    }
  }
}

export const wizardService = new WizardService()
