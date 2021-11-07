import { Overlay, CommandPlugin, OverlayResult } from "./interface";
import SHACLValidator from "rdf-validate-shacl";
import { parseJsonLd } from "../utils/rdf";
import { logger } from "../services/logger";

export class SoyaValidate implements CommandPlugin {

  run = async (overlay: Overlay, data: any): Promise<OverlayResult> => {
    const dataSet = await parseJsonLd(data);

    if (dataSet.length === 0)
      throw new Error('Input data is not valid JSON-LD!');

    const layerSet = await parseJsonLd(overlay);
    const validator = new SHACLValidator(layerSet);
    const res = await validator.validate(dataSet);

    logger.debug('Data to validate:', dataSet);
    logger.debug('SHACL:', layerSet);

    return {
      data: {
        isValid: res.conforms,
        results: res.results.map(x => ({
          message: x.message,
          ...x.path,
          severity: x.severity,
        })),
      }
    };
  }
}