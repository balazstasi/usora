import { Suspense } from "react"
import { WizardContainer } from "@/components/wizard/wizard-container"
import { wizardService } from "@/lib/api/wizard-service"
import type { WizardServerProps, TransactionData, ApiResponse } from "@/types/wizard"

// Server Component for initial data loading
async function WizardServerData({ userId, transactionId, mode }: WizardServerProps) {
  // This would typically fetch user-specific data, transaction data, etc.
  const initialData = {
    step1: {
      isLendingMode: mode === "create" ? true : undefined,
    },
  }

  return { initialData }
}

export default async function WizardPage({
  searchParams,
}: {
  searchParams: { userId?: string; transactionId?: string; mode?: "create" | "edit" }
}) {
  const { userId, transactionId, mode = "create" } = searchParams

  const handleComplete = async (data: TransactionData): Promise<ApiResponse> => {
    "use server"
    return await wizardService.submitTransaction(data)
  }

  const handleStepChange = (stepIndex: number, stepData: any) => {
    console.log(`Step ${stepIndex} data:`, stepData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">
            {mode === "edit" ? "Edit Transaction" : "Create New Transaction"}
          </h1>

          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            }
          >
            <WizardContainer
              initialData={(await WizardServerData({ userId, transactionId, mode })).initialData}
              onComplete={handleComplete}
              onStepChange={handleStepChange}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
