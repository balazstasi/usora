"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MobileHeaderProps } from "@/types";

export function MobileHeader({
  currentPage,
  onPageChange,
  onBack,
  showBack,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 animate-slide-in-up">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover-scale transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold">
              {currentPage === "form" ? "New Transaction" : "Track Payments"}
            </h1>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover-scale transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 animate-slide-in-right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Account
              </SheetTitle>
              <SheetDescription>user@example.com</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              <Button
                variant={currentPage === "form" ? "default" : "ghost"}
                className="w-full justify-start hover-lift transition-all duration-200"
                onClick={() => onPageChange("form")}
              >
                New Transaction
              </Button>
              <Button
                variant={currentPage === "tracking" ? "default" : "ghost"}
                className="w-full justify-start hover-lift transition-all duration-200"
                onClick={() => onPageChange("tracking")}
              >
                Track Payments
              </Button>
              <div className="border-t pt-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => onPageChange("dashboard")}
                  className="w-full justify-start hover-lift transition-all duration-200"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover-lift transition-all duration-200"
                >
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
