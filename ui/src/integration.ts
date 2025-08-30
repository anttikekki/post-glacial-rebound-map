import "bootstrap/dist/css/bootstrap.min.css";
import iceYears from "../../common/iceMapLayerYears.json";
import v1Years from "../../common/mapLayerYearsModelV1.json";
import v2Years from "../../common/mapLayerYearsModelV2.json";

const tableBody = document.getElementById("apiTableYearsTBody");

for (const v2Year of v2Years) {
  /*
    <tr>
        <th scope="row">10 000 eaa.</th>
        <td></td>
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
    if (v2Year >= 0) {
      return `${v2Year} jaa.`;
    } else {
      return `${-v2Year} eaa.`;
    }
  })();
  tr.append(th);

  const v1Column = document.createElement("td");
  if (v1Years.includes(v2Year)) {
    const a = document.createElement("a");
    a.href = `https://maannousu.info/api/v1/${v2Year}`;
    a.innerHTML = `https://maannousu.info/api/v1/${v2Year}`;
    v1Column.append(a);
  }
  tr.append(v1Column);

  const v2Column = document.createElement("td");
  const a = document.createElement("a");
  a.href = `https://maannousu.info/api/v2/${v2Year}`;
  a.innerHTML = `https://maannousu.info/api/v2/${v2Year}`;
  v2Column.append(a);
  tr.append(v2Column);

  const iceColumn = document.createElement("td");
  if (iceYears.includes(v2Year)) {
    const a = document.createElement("a");
    a.href = `https://maannousu.info/api/v2/ice/${v2Year}`;
    a.innerHTML = `https://maannousu.info/api/v2/ice/${v2Year}`;
    iceColumn.append(a);
  }
  tr.append(iceColumn);

  tableBody?.append(tr);
}
