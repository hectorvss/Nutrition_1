// Factory para crear clientes de Stripe con configuracion segura por defecto.
//
// Por que:
// - Antes habia 6 `new Stripe(key)` repartidos por el codigo, ninguno con
//   timeout. Si Stripe API atasca, los lambdas de Vercel se cuelgan hasta
//   los 30s (limite de plataforma) y se traga toda la slot.
// - timeout: 8000 ms da margen suficiente para operaciones legitimas pero
//   corta antes de que Vercel mate el lambda.
// - maxNetworkRetries: 1 reintenta una vez ante errores transientes de red
//   sin amplificar la latencia total.
//
// Uso:
//   import { newStripeClient } from '../lib/stripe.js';
//   const stripe = newStripeClient(myApiKey);

import Stripe from 'stripe';

export function newStripeClient(apiKey: string): Stripe {
  return new Stripe(apiKey, {
    apiVersion: '2024-12-18.acacia' as any,
    timeout: 8000,
    maxNetworkRetries: 1,
  });
}
