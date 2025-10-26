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

import iceYears from "../../common/iceMapLayerYears.json";
import years from "../../common/seaMapLayerYears.json";
import hamina from "../../map-data-processing/07_statistics/calculation_results/json/Hamina.json";
import hanko from "../../map-data-processing/07_statistics/calculation_results/json/Hanko.json";
import helsinki from "../../map-data-processing/07_statistics/calculation_results/json/Helsinki.json";
import kokkola from "../../map-data-processing/07_statistics/calculation_results/json/Kokkola.json";
import kristiinankaupunki from "../../map-data-processing/07_statistics/calculation_results/json/Kristiinankaupunki.json";
import maarianhamina from "../../map-data-processing/07_statistics/calculation_results/json/Maarianhamina.json";
import oulu from "../../map-data-processing/07_statistics/calculation_results/json/Oulu.json";
import pori from "../../map-data-processing/07_statistics/calculation_results/json/Pori.json";
import rovaniemi from "../../map-data-processing/07_statistics/calculation_results/json/Rovaniemi.json";
import tornio from "../../map-data-processing/07_statistics/calculation_results/json/Tornio.json";
import turku from "../../map-data-processing/07_statistics/calculation_results/json/Turku.json";
import vaasa from "../../map-data-processing/07_statistics/calculation_results/json/Vaasa.json";

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
  data: location.data.map(({ year, delta10BC }) => ({
    x: year,
    y: delta10BC,
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
        text: "Glare-malli: Maankohoamisen kaupungeittain siitä päivästä lähtien, kun paikka tuli esiin jään alta",
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
            const year = context.parsed.x!;
            const elevation = context.parsed.y!;

            return [
              formatYear(year),
              `Maankohoaminen verrattuna hetkeen, jolloin paikka tuli esiin jään alta:`,
              `+${elevation.toFixed(1)} metriä`,
            ];
          },
        },
      },
      zoom: {
        limits: {
          x: { min: "original", max: "original", minRange: 5000 },
          y: { min: "original", max: "original", minRange: 50 },
        },
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
          text: "Maankohoaminen verrattuna hetkeen, jolloin paikka tuli esiin jään alta (m)",
          font: {
            weight: "bold",
          },
        },
      },
    },
  },
});

const tableBody = document.getElementById("apiTableYearsTBody");

for (const year of years) {
  /*
    <tr>
        <th scope="row">10 000 eaa.</th>
        <td>
            <a href="https://maannousu.info/api/v2/-10000"
            >https://maannousu.info/api/v2/-10000</a
            >
        </td>
        <td>
            <a href="https://maannousu.info/api/v2/ice/-10000"
            >https://maannousu.info/api/v2/ice/-10000</a
            >
        </td>
    </tr>
    */
  const tr = document.createElement("tr");

  // Row header
  const th = document.createElement("th");
  th.innerHTML = (() => {
    if (year >= 0) {
      return `${year} jaa.`;
    } else {
      return `${-year} eaa.`;
    }
  })();
  tr.append(th);

  const seaColumn = document.createElement("td");
  const a = document.createElement("a");
  a.href = `https://maannousu.info/api/v2/${year}`;
  a.innerHTML = `https://maannousu.info/api/v2/${year}`;
  seaColumn.append(a);
  tr.append(seaColumn);

  const iceColumn = document.createElement("td");
  if (iceYears.includes(year)) {
    const a = document.createElement("a");
    a.href = `https://maannousu.info/api/v2/ice/${year}`;
    a.innerHTML = `https://maannousu.info/api/v2/ice/${year}`;
    iceColumn.append(a);
  }
  tr.append(iceColumn);

  tableBody?.append(tr);
}
