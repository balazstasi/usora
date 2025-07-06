import { NextResponse } from "next/server"
import { createWizardConfig } from "@/lib/utils/wizard-helpers"
import type { ApiResponse, WizardConfig } from "@/types/wizard"

export async function GET() {
  try {
    const config = createWizardConfig(0)

    const response: ApiResponse<WizardConfig> = {
      success: true,
      data: config,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Config API error:", error)

    const response: ApiResponse = {
      success: false,
      error: "Failed to load configuration",
    }

    return NextResponse.json(response, { status: 500 })
  }
}
