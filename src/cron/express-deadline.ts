import cron from "node-cron";
import { prisma } from "../db";
import { winstonlogger } from "../lib/winston-logger";

const EXTEND_HOURS = 8;

export function startExpressDeadlineCron(): void {
  cron.schedule("*/30 * * * *", async (): Promise<void> => {
    try {
      const affected = await prisma.$executeRaw`
        UPDATE orders 
        SET estimated_done = DATE_ADD(estimated_done, INTERVAL ${EXTEND_HOURS} HOUR)
        WHERE is_express = true
          AND estimated_done IS NOT NULL
          AND status NOT IN ('ready', 'picked_up')
          AND NOW() > estimated_done
      `;

      if (affected > 0) {
        winstonlogger.info(
          `[CRON] Extended deadline ${affected} express order(s) by ${EXTEND_HOURS}h`,
        );
      }
    } catch (err) {
      winstonlogger.error(`[CRON] Express deadline error: ${err}`);
    }
  });

  winstonlogger.info("[CRON] Express deadline checker started (every 30m)");
}
