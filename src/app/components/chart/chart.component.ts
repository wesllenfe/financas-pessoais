import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CategorySummary } from "../../models/transaction.model";
import { Chart, registerables } from "chart.js";
import { NgIf } from "@angular/common";

Chart.register(...registerables);

@Component({
  selector: "app-chart",
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class ChartComponent implements OnChanges, AfterViewInit {
  @Input() categories: CategorySummary[] = [];
  @Input() type: "pie" | "doughnut" | "bar" = "doughnut";
  @Input() chartType: 'income' | 'expense' = 'expense';
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["categories"] && !changes["categories"].firstChange) {
      this.updateChart();
    }
    if (changes["type"] && !changes["type"].firstChange) {
      this.createChart();
    }
  }

  private createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.chartCanvas || this.categories.length === 0) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const defaultColors = this.getDefaultColors();

    this.chart = new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.categories.map((c) => c.category),
        datasets: [{
          data: this.categories.map((c) => c.amount),
          backgroundColor: defaultColors.slice(0, this.categories.length),
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const percentage = this.categories[context.dataIndex].percentage.toFixed(1);
                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  private getDefaultColors(): string[] {
    if (this.chartType === 'income') {
      // Tons de verde para receitas
      return [
        '#4CAF50', '#81C784', '#66BB6A', '#43A047', '#388E3C',
        '#2E7D32', '#1B5E20', '#A5D6A7', '#C8E6C9', '#E8F5E9'
      ];
    } else {
      // Tons de vermelho para despesas
      return [
        '#F44336', '#E57373', '#EF5350', '#E53935', '#D32F2F',
        '#C62828', '#B71C1C', '#FFCDD2', '#EF9A9A', '#FFEBEE'
      ];
    }
  }

  private updateChart() {
    if (!this.chart || this.categories.length === 0) {
      this.createChart();
      return;
    }

    this.chart.data.labels = this.categories.map((c) => c.category);
    this.chart.data.datasets[0].data = this.categories.map((c) => c.amount);
    this.chart.data.datasets[0].backgroundColor = this.getDefaultColors().slice(0, this.categories.length);
    this.chart.update();
  }
}
