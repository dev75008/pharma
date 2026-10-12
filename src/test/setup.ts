import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
afterEach(cleanup);

vi.mock('virtual:pwa-register/react',()=>({useRegisterSW:()=>({needRefresh:[false,()=>{}],offlineReady:[false,()=>{}],updateServiceWorker:async()=>{}})}));

vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
