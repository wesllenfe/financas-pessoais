import { Injectable } from "@angular/core"
import { TransactionService } from "./transaction.service"
import { ReportFilter, TrendData, CategoryTrend } from "../models/report.model"
import { Transaction } from "../models/transaction.model"
import * as pdfMake from "pdfmake/build/pdfmake"
import * as pdfFonts from "pdfmake/build/vfs_fonts"
import { saveAs } from "file-saver"
import { TDocumentDefinitions } from "pdfmake/interfaces"

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private colors = [
    "#4F46E5", // Indigo
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#14B8A6", // Teal
  ]

  constructor(private transactionService: TransactionService) {}

  async getTransactionsByPeriod(filter: ReportFilter): Promise<Transaction[]> {
    return this.transactionService.getFilteredTransactionsPromise(filter)
  }

  async generateMonthlyTrends(months = 6): Promise<TrendData[]> {
    const trends: TrendData[] = []
    const now = new Date()

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()

      const startDate = new Date(year, month, 1).toISOString()
      const endDate = new Date(year, month + 1, 0).toISOString()

      const filter: ReportFilter = { startDate, endDate }
      const transactions = await this.transactionService.getFilteredTransactionsPromise(filter)

      const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      const balance = income - expense

      const monthName = date.toLocaleString("default", { month: "short" })
      const label = `${monthName}/${year}`

      trends.unshift({ label, income, expense, balance })
    }

    return trends
  }

  async generateCategoryTrends(months = 6, type: "income" | "expense" = "expense"): Promise<CategoryTrend[]> {
    const now = new Date()
    const categoryMap = new Map<string, number[]>()
    const labels: string[] = []

    // Coletar dados para cada mês
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()

      const startDate = new Date(year, month, 1).toISOString()
      const endDate = new Date(year, month + 1, 0).toISOString()

      const filter: ReportFilter = { startDate, endDate, types: [type] }
      const transactions = await this.transactionService.getFilteredTransactionsPromise(filter)

      // Agrupar por categoria
      const categoryAmounts = new Map<string, number>()
      transactions.forEach((t) => {
        const current = categoryAmounts.get(t.category) || 0
        categoryAmounts.set(t.category, current + t.amount)
      })

      // Adicionar ao mapa de categorias
      categoryAmounts.forEach((amount, category) => {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, Array(months).fill(0))
        }
        categoryMap.get(category)![months - i - 1] = amount
      })

      // Adicionar rótulo do mês
      const monthName = date.toLocaleString("default", { month: "short" })
      labels.unshift(`${monthName}/${year}`)
    }

    // Converter para o formato de saída
    const trends: CategoryTrend[] = []
    let colorIndex = 0

    categoryMap.forEach((values, category) => {
      trends.push({
        category,
        values,
        color: this.colors[colorIndex % this.colors.length],
      })
      colorIndex++
    })

    return trends
  }

  async calculateAverageDailyExpense(days = 30): Promise<number> {
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
    const endDate = now.toISOString()

    const filter: ReportFilter = { startDate, endDate, types: ["expense"] }
    const transactions = await this.transactionService.getFilteredTransactionsPromise(filter)

    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0)
    return totalExpense / days
  }

  async calculateCategoryAverages(
    months = 3,
    type: "income" | "expense" = "expense",
  ): Promise<{ category: string; average: number }[]> {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1).toISOString()
    const endDate = now.toISOString()

    const filter: ReportFilter = { startDate, endDate, types: [type] }
    const transactions = await this.transactionService.getFilteredTransactionsPromise(filter)

    // Agrupar por categoria
    const categoryAmounts = new Map<string, number[]>()

    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`

      if (!categoryAmounts.has(t.category)) {
        categoryAmounts.set(t.category, [])
      }

      categoryAmounts.get(t.category)!.push(t.amount)
    })

    // Calcular médias
    const averages: { category: string; average: number }[] = []

    categoryAmounts.forEach((amounts, category) => {
      const total = amounts.reduce((sum, amount) => sum + amount, 0)
      const average = total / months
      averages.push({ category, average })
    })

    return averages.sort((a, b) => b.average - a.average)
  }

  async exportToPDF(filter: ReportFilter): Promise<void> {
    const transactions = await this.transactionService.getFilteredTransactionsPromise(filter)

    // Calcular totais
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expense

    // Formatar datas
    const startDate = new Date(filter.startDate).toLocaleDateString()
    const endDate = new Date(filter.endDate).toLocaleDateString()

    // Preparar dados para a tabela
    const tableBody = [
      ["Descrição", "Categoria", "Data", "Tipo", "Valor"],
      ...transactions.map((t) => [
        t.description,
        t.category,
        new Date(t.date).toLocaleDateString(),
        t.type === "income" ? "Receita" : "Despesa",
        `R$ ${t.amount.toFixed(2)}`,
      ]),
    ]

    // Definir documento PDF - Fix the type and margin format
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: "Relatório Financeiro", style: "header" },
        { text: `Período: ${startDate} a ${endDate}`, style: "subheader" },
        { text: "\n" },
        {
          columns: [
            {
              width: "33%",
              text: [
                { text: "Receitas\n", style: "label" },
                { text: `R$ ${income.toFixed(2)}`, style: "income" },
              ],
            },
            {
              width: "33%",
              text: [
                { text: "Despesas\n", style: "label" },
                { text: `R$ ${expense.toFixed(2)}`, style: "expense" },
              ],
            },
            {
              width: "33%",
              text: [
                { text: "Saldo\n", style: "label" },
                { text: `R$ ${balance.toFixed(2)}`, style: balance >= 0 ? "income" : "expense" },
              ],
            },
          ],
        },
        { text: "\n\n" },
        { text: "Transações", style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto", "auto"],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10], // Fixed format: [left, top, right, bottom]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5], // Fixed format: [left, top, right, bottom]
        },
        label: {
          fontSize: 12,
          color: "#666666",
        },
        income: {
          fontSize: 16,
          bold: true,
          color: "#10B981",
        },
        expense: {
          fontSize: 16,
          bold: true,
          color: "#EF4444",
        },
      },
    }

    // Gerar PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition)
    pdfDocGenerator.getBlob((blob) => {
      saveAs(blob, `relatorio-financeiro-${startDate}-${endDate}.pdf`)
    })
  }

  async exportToCSV(filter: ReportFilter): Promise<void> {
    const transactions = await this.transactionService.getFilteredTransactionsPromise(filter)

    // Cabeçalho CSV
    let csv = "Descrição,Categoria,Data,Tipo,Valor\n"

    // Adicionar linhas
    transactions.forEach((t) => {
      const row = [
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${new Date(t.date).toLocaleDateString()}"`,
        `"${t.type === "income" ? "Receita" : "Despesa"}"`,
        `${t.amount}`,
      ].join(",")

      csv += row + "\n"
    })

    // Criar blob e fazer download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const startDate = new Date(filter.startDate).toLocaleDateString().replace(/\//g, "-")
    const endDate = new Date(filter.endDate).toLocaleDateString().replace(/\//g, "-")
    saveAs(blob, `transacoes-${startDate}-${endDate}.csv`)
  }
}
