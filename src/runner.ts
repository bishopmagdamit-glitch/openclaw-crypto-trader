import 'dotenv/config';
import { z } from 'zod';
import { setTimeout as sleep } from 'node:timers/promises';

const Env = z.object({
  TRADE_INTERVAL_SEC: z.coerce.number().default(300),
  MAX_TRADE_USDC: z.coerce.number().default(50),
});

async function cycle() {
  // placeholder: research/risk/exec wiring next
  console.log('[cycle]', new Date().toISOString(), 'tick');
}

async function main() {
  const env = Env.parse(process.env);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await cycle();
    await sleep(env.TRADE_INTERVAL_SEC * 1000);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
