import type { TransactionData, TrackedTransaction } from "@/types"

// API service functions - implement these with your actual backend
export class TransactionService {
  static async createLendingRequest(
    data: TransactionData,
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // TODO: Implement actual API call to create lending request
    console.log("Creating lending request:", data)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      transactionId: `lending_${Date.now()}`,
    }
  }

  static async schedulePayments(
    data: TransactionData,
  ): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
    // TODO: Implement actual API call to schedule payments
    console.log("Scheduling payments:", data)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      scheduleId: `schedule_${Date.now()}`,
    }
  }

  static async saveDraft(data: TransactionData): Promise<{ success: boolean; draftId?: string; error?: string }> {
    // TODO: Implement actual API call to save draft
    console.log("Saving draft:", data)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      draftId: `draft_${Date.now()}`,
    }
  }

  static async getTrackedTransactions(): Promise<{
    success: boolean
    transactions?: TrackedTransaction[]
    error?: string
  }> {
    // TODO: Implement actual API call to fetch tracked transactions
    console.log("Fetching tracked transactions")

    // Simulate API call with mock data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockTransactions: TrackedTransaction[] = [
      {
        id: "1",
        type: "lending",
        recipientEmail: "alice@example.com",
        totalAmount: 1000,
        remainingAmount: 600,
        nextPaymentDate: new Date(2024, 11, 15), // December 15, 2024
        nextPaymentAmount: 200,
        status: "active",
        createdAt: new Date(2024, 10, 1), // November 1, 2024
        installments: [
          {
            id: "1-1",
            amount: 200,
            dueDate: new Date(2024, 10, 15),
            paidDate: new Date(2024, 10, 14),
            status: "paid",
          },
          {
            id: "1-2",
            amount: 200,
            dueDate: new Date(2024, 11, 15),
            status: "pending",
          },
          {
            id: "1-3",
            amount: 200,
            dueDate: new Date(2025, 0, 15),
            status: "pending",
          },
        ],
      },
      {
        id: "2",
        type: "receiving",
        recipientEmail: "bob@example.com",
        totalAmount: 500,
        remainingAmount: 250,
        nextPaymentDate: new Date(2024, 11, 10), // December 10, 2024
        nextPaymentAmount: 125,
        status: "active",
        createdAt: new Date(2024, 10, 15),
        installments: [
          {
            id: "2-1",
            amount: 125,
            dueDate: new Date(2024, 10, 25),
            paidDate: new Date(2024, 10, 25),
            status: "paid",
          },
          {
            id: "2-2",
            amount: 125,
            dueDate: new Date(2024, 11, 10),
            status: "pending",
          },
        ],
      },
      {
        id: "3",
        type: "lending",
        recipientEmail: "charlie@example.com",
        totalAmount: 300,
        remainingAmount: 300,
        nextPaymentDate: new Date(2024, 11, 5), // December 5, 2024 (overdue)
        nextPaymentAmount: 150,
        status: "overdue",
        createdAt: new Date(2024, 10, 20),
        installments: [
          {
            id: "3-1",
            amount: 150,
            dueDate: new Date(2024, 11, 5),
            status: "overdue",
          },
        ],
      },
    ]

    return {
      success: true,
      transactions: mockTransactions,
    }
  }
}
