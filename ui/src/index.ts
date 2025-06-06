import "bootstrap/dist/css/bootstrap.min.css";
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

import hamina from "../../map-data-processing/07_statistics/results/Hamina.json";
import hanko from "../../map-data-processing/07_statistics/results/Hanko.json";
import helsinki from "../../map-data-processing/07_statistics/results/Helsinki.json";
import kokkola from "../../map-data-processing/07_statistics/results/Kokkola.json";
import kristiinankaupunki from "../../map-data-processing/07_statistics/results/Kristiinankaupunki.json";
import maarianhamina from "../../map-data-processing/07_statistics/results/Maarianhamina.json";
import oulu from "../../map-data-processing/07_statistics/results/Oulu.json";
import pori from "../../map-data-processing/07_statistics/results/Pori.json";
import rovaniemi from "../../map-data-processing/07_statistics/results/Rovaniemi.json";
import tornio from "../../map-data-processing/07_statistics/results/Tornio.json";
import turku from "../../map-data-processing/07_statistics/results/Turku.json";
import vaasa from "../../map-data-processing/07_statistics/results/Vaasa.json";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

const datasets = [
  hamina,
  helsinki,
  hanko,
  turku,
  maarianhamina,
  pori,
  kristiinankaupunki,
  vaasa,
  kokkola,
  oulu,
  tornio,
  rovaniemi,
].map((location, index) => ({
  label: location.name,
  data: location.data
    .filter(({ year }) => year >= -5500)
    .map(({ year, delta }) => ({
      x: year,
      y: delta,
    })),
  borderColor: generateColor(index),
  backgroundColor: generateColor(index),
  borderWidth: 2,
  tension: 0.3,
  fill: false,
}));

const canvas = document.getElementById("statisticsChart") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
new Chart(ctx, {
  type: "line",
  data: {
    datasets: datasets,
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Maankohoamisen nopeus",
      },
      legend: {
        display: true,
        position: "right",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const y = context.parsed.y;
            return `${label}: ${y} m`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Vuosi",
        },
        ticks: {
          maxTicksLimit: 20,
          callback: function (value) {
            const year = typeof value === "string" ? parseInt(value) : value;
            return year < 0 ? `${Math.abs(year)} eaa.` : `${year} jaa.`;
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Maamkohoaminen per 250 vuotta (m)",
        },
      },
    },
  },
});
