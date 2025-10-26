import eraEn from "../translations/era_en.json";
import eraFi from "../translations/era_fi.json";
import eraSv from "../translations/era_sv.json";
import mapEn from "../translations/map_en.json";
import mapFi from "../translations/map_fi.json";
import mapSv from "../translations/map_sv.json";

export const [mapTrans, eraTrans] = (() => {
  switch (document.documentElement.lang) {
    case "sv":
      return [mapSv, eraSv];
    case "en":
      return [mapEn, eraEn];
    case "fi":
    default:
      return [mapFi, eraFi];
  }
})();
