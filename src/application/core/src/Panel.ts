import type { Panel as PanelModel, PanelType, PanelUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class Panel extends Base {
  public async save(input: PanelUpsertInput): Promise<PanelModel> {
    return await this.state.database.panel.upsert(input);
  }

  public async findAll(panelType?: PanelType) {
    return await this.state.database.panel.findAll(panelType);
  }
}
