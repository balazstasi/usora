import { type NextRequest, NextResponse } from "next/server"
import { wizardService } from "@/lib/api/wizard-service"
import type { ValidationResult } from "@/types/wizard"

export async function POST(request: NextRequest) {
  try {
    const { stepIndex, data } = await request.json()

    let validationResult: ValidationResult

    switch (stepIndex) {
      case 0:
        validationResult = wizardService.validateStep1(data)
        break
      case 1:
        validationResult = wizardService.validateStep2(data)
        break
      case 2:
        validationResult = wizardService.validateStep3(data)
        break
      default:
        validationResult = {
          isValid: false,
          errors: { general: "Invalid step index" },
          warnings: {},
        }
    }

    return NextResponse.json(validationResult)
  } catch (error) {
    console.error("Validation API error:", error)
    return NextResponse.json(
      {
        isValid: false,
        errors: { general: "Validation failed" },
        warnings: {},
      },
      { status: 500 },
    )
  }
}
