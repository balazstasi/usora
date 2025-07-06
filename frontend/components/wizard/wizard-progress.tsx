import { Check } from "lucide-react"
import type { WizardProgressProps } from "@/types/wizard"

export function WizardProgress({ config, className }: WizardProgressProps) {
  return (
    <div className={`px-8 py-6 ${className || ""}`}>
      <div className="flex items-center justify-center max-w-md mx-auto">
        {config.steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-500 ${
                  step.isComplete
                    ? "border-green-500 bg-green-500 text-white"
                    : step.isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step.isComplete ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium transition-colors duration-300 ${
                    step.isActive || step.isComplete ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs hidden sm:block transition-colors duration-300 ${
                    step.isActive || step.isComplete ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {index < config.steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-700 ${
                  step.isComplete ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
