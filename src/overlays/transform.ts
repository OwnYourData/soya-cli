import * as jq from 'node-jq';
import { Overlay, CommandPlugin, OverlayResult } from './interface';

export class SoyaTransform implements CommandPlugin {
  run = async (overlay: Overlay, data: any): Promise<OverlayResult> => {
    let res = { data };

    for (const item of overlay['@graph']) {
      if (item['@id'] === 'transform_rdf2json') {

        try {
          const jqOutput = await jq.run(item.jq_transform, data, {
            input: 'json',
          });

          if (typeof jqOutput === 'string')
            res.data = JSON.parse(jqOutput);
          else
            res.data = jqOutput;
        } catch { }
      }
    }

    return res;
  }
}