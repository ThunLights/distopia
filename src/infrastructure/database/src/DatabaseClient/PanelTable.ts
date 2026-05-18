import type { Panel, PanelType } from "../types";
import { Base } from "./Base";

export class PanelTable extends Base {
  public async findAll(panelType?: PanelType): Promise<Panel[]> {
    return await this.prisma.panel.findMany({ where: { type: panelType } });
  }

  public async upsert(input: Panel) {
    return await this.prisma.panel.upsert({
      where: { guildId_type: { guildId: input.guildId, type: input.type } },
      update: input,
      create: input,
    });
  }
}
