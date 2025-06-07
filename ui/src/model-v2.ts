import "bootstrap/dist/css/bootstrap.min.css";
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  SubTitle,
  Title,
  Tooltip,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

import hamina from "../../map-data-processing/07_statistics/results/V2/Hamina.json";
import hanko from "../../map-data-processing/07_statistics/results/V2/Hanko.json";
import helsinki from "../../map-data-processing/07_statistics/results/V2/Helsinki.json";
import kokkola from "../../map-data-processing/07_statistics/results/V2/Kokkola.json";
import kristiinankaupunki from "../../map-data-processing/07_statistics/results/V2/Kristiinankaupunki.json";
import maarianhamina from "../../map-data-processing/07_statistics/results/V2/Maarianhamina.json";
import oulu from "../../map-data-processing/07_statistics/results/V2/Oulu.json";
import pori from "../../map-data-processing/07_statistics/results/V2/Pori.json";
import rovaniemi from "../../map-data-processing/07_statistics/results/V2/Rovaniemi.json";
import tornio from "../../map-data-processing/07_statistics/results/V2/Tornio.json";
import turku from "../../map-data-processing/07_statistics/results/V2/Turku.json";
import vaasa from "../../map-data-processing/07_statistics/results/V2/Vaasa.json";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  SubTitle,
  Tooltip,
  Legend,
  zoomPlugin
);

function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

const datasets = [
  hamina,
  hanko,
  helsinki,
  turku,
  kokkola,
  kristiinankaupunki,
  maarianhamina,
  oulu,
  pori,
  rovaniemi,
  tornio,
  vaasa,
].map((location, index) => ({
  label: location.name,
  data: location.data.map(({ year, delta }) => ({
    x: year,
    y: delta,
  })),
  borderColor: generateColor(index),
  backgroundColor: generateColor(index),
  borderWidth: 2,
  tension: 0.3,
  fill: false,
}));

const formatYear = (year: number) =>
  year < 0 ? `${Math.abs(year).toFixed(0)} eaa.` : `${year.toFixed(0)} jaa.`;

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
        text: "Glare-malli: Maankohoamisen nopeus suhteessa merenpintaan 250 vuoden jaksoissa",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      subtitle: {
        display: true,
        text: "Kuvaajaa voi zoomata hiiren rullalla tai kosketusnäytön nipistyksellä.",
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
          title: (contexts) => {
            return contexts.map((context) => {
              return context.dataset.label || "";
            });
          },
          label: (context) => {
            const yearEnd = context.parsed.x;
            const yearStart = yearEnd - 250;
            const elevation = context.parsed.y;

            return [
              `${formatYear(yearStart)} - ${formatYear(yearEnd)}`,
              `Muutos: ${elevation > 0 ? `+${elevation}` : elevation} metriä`,
            ];
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Vuosi",
          font: {
            weight: "bold",
          },
        },
        ticks: {
          callback: function (value) {
            const year = typeof value === "string" ? parseInt(value) : value;
            return formatYear(year);
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Maamkohoaminen per 250 vuotta (m)",
          font: {
            weight: "bold",
          },
        },
      },
    },
  },
});
