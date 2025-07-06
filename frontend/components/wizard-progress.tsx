"use client"

import * as React from "react"
import { Check } from "lucide-react"
import type { WizardStep } from "@/types"

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number
  previousStep: number
}

export function WizardProgress({ steps, currentStep, previousStep }: WizardProgressProps) {
  const [animatingSteps, setAnimatingSteps] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    if (currentStep !== previousStep) {
      // Animate the step that just completed
      if (currentStep > previousStep) {
        setAnimatingSteps(new Set([previousStep]))
        setTimeout(() => setAnimatingSteps(new Set()), 500)
      }
    }
  }, [currentStep, previousStep])

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-center max-w-md mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium smooth-transition ${
                  index < currentStep
                    ? `border-green-500 bg-green-500 text-white ${animatingSteps.has(index) ? "progress-step-complete" : ""}`
                    : index === currentStep
                      ? "border-blue-500 bg-blue-500 text-white progress-step-active"
                      : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium smooth-transition ${
                    index <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs hidden sm:block smooth-transition ${
                    index <= currentStep ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 smooth-transition ${
                  index < currentStep ? "bg-green-500 progress-line-fill" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
