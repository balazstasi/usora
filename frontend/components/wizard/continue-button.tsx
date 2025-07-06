"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { ContinueButtonProps } from "@/types/wizard"

export function ContinueButton({
  isEnabled,
  isLoading,
  onContinue,
  onValidate,
  children,
  className,
}: ContinueButtonProps) {
  const [isValidating, setIsValidating] = useState(false)

  const handleClick = async () => {
    if (!isEnabled || isLoading || isValidating) return

    try {
      // Run validation if provided
      if (onValidate) {
        setIsValidating(true)
        const validationResult = await onValidate()

        if (!validationResult.isValid) {
          return // Don't proceed if validation fails
        }
      }

      // Execute continue action
      await onContinue()
    } catch (error) {
      console.error("Continue action failed:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const isDisabled = !isEnabled || isLoading || isValidating

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={`flex-1 h-12 transition-all duration-200 ${
        isEnabled && !isLoading && !isValidating ? "hover:shadow-md hover:-translate-y-0.5" : ""
      } ${className || ""}`}
    >
      {isLoading || isValidating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          {isValidating ? "Validating..." : "Loading..."}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}
