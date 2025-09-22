import { registerPlugin } from '@capacitor/core';

import type { AirbridgePlugin } from './definitions';

const Airbridge = registerPlugin<AirbridgePlugin>('Airbridge', {
  web: () => import('./web').then(m => new m.AirbridgeWeb()),
});

export * from './definitions';
export { Airbridge };