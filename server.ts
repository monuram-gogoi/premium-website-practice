import express from 'express';
import path from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Configure dotenv to read local environment variables
import dotenv from 'dotenv';
dotenv.config();

let razorpayInstance: Razorpay | null = null;

// Lazy initialization of Razorpay SDK to prevent server crash on startup if credentials are not configured.
function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } catch (err) {
      console.error('Failed to initialize Razorpay SDK:', err);
    }
  }
  return razorpayInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON bodies
  app.use(express.json());

  // Allow CORS for local debug (standard Express setup)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================================================
  // PAYMENT API ENDPOINTS (RAZORPAY INTEGRATION)
  // ==========================================================================

  // Health check
  app.get('/api/health', (req, res) => {
    const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const isSupabaseConfigured = !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
    res.json({
      status: 'healthy',
      time: new Date().toISOString(),
      integrations: {
        razorpay: isRazorpayConfigured ? 'configured' : 'sandbox_simulation_mode',
        supabase: isSupabaseConfigured ? 'configured' : 'client_side_simulation_mode'
      }
    });
  });

  // 1. Create a Razorpay Order
  app.post('/api/payments/create-order', async (req, res) => {
    const { amount, orderId } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const rzp = getRazorpay();

    if (!rzp) {
      // Sandbox Simulation Fallback Mode
      console.log(`[Razorpay Sandbox] Simulating order creation for ${amount} INR (internal order ID: ${orderId})`);
      const mockOrder = {
        id: `rzp_order_sim_${Math.random().toString(36).substr(2, 10)}`,
        entity: 'order',
        amount: Math.round(amount * 100), // convert to paise
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency: 'INR',
        receipt: orderId || `receipt_${Date.now()}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        is_simulated: true,
        key_id: 'rzp_test_simulation_mode_key'
      };
      return res.json(mockOrder);
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // amount in paise (1 INR = 100 paise)
        currency: 'INR',
        receipt: orderId || `receipt_${Date.now()}`,
      };

      const order = await rzp.orders.create(options);
      return res.json({
        ...order,
        key_id: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({
        error: 'Razorpay order creation failed',
        details: error.message || error
      });
    }
  });

  // 2. Verify Razorpay Payment Signature
  app.post('/api/payments/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (razorpay_order_id?.startsWith('rzp_order_sim_')) {
      // Sandbox simulation mode
      console.log(`[Razorpay Sandbox] Automatically verified simulation payment ID: ${razorpay_payment_id}`);
      return res.json({ status: 'success', is_simulated: true });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: 'Razorpay is not configured on this server.' });
    }

    try {
      // Calculate signature to verify authenticity
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        console.log(`Payment successfully verified for order: ${razorpay_order_id}`);
        return res.json({ status: 'success', verified: true });
      } else {
        console.error('Razorpay signature mismatch');
        return res.status(400).json({ error: 'Signature verification failed' });
      }
    } catch (error: any) {
      console.error('Payment signature verification crash:', error);
      return res.status(500).json({ error: 'Verification crashed', details: error.message });
    }
  });

  // 3. Razorpay Webhook Endpoint
  app.post('/api/payments/webhook', (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!webhookSecret || !signature) {
      console.warn('Webhook received but missing signature or webhook secret configuration');
      return res.status(400).send('Webhook verification ignored');
    }

    try {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest === signature) {
        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`Razorpay Verified Webhook Event Received: ${event}`, JSON.stringify(payload));

        // Handle specific Razorpay events (e.g. payment.captured, order.paid)
        if (event === 'payment.captured' || event === 'order.paid') {
          const paymentEntity = payload.payment.entity;
          const rzpOrderId = paymentEntity.order_id;
          const rzpPaymentId = paymentEntity.id;
          const status = paymentEntity.status;
          const amount = paymentEntity.amount / 100;

          console.log(`Order ${rzpOrderId} has been PAID with payment ${rzpPaymentId} for amount ${amount}`);
          // Note: In production, the backend would trigger database models to update the orders status to 'paid'
        }

        return res.json({ status: 'ok' });
      } else {
        console.error('Invalid Webhook Signature');
        return res.status(403).send('Invalid Signature');
      }
    } catch (err: any) {
      console.error('Webhook processing exception:', err);
      return res.status(500).send('Webhook Exception');
    }
  });

  // ==========================================================================
  // VITE DEV SERVER / PRODUCTION STATIC ASSET ROUTING
  // ==========================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ECommerce Application Running at http://localhost:${PORT}`);
    console.log(`Environment variables check:`);
    console.log(`- Supabase Client: ${process.env.VITE_SUPABASE_URL ? 'CONFIGURED' : 'UNCONFIGURED (Fallback active)'}`);
    console.log(`- Razorpay SDK: ${process.env.RAZORPAY_KEY_ID ? 'CONFIGURED' : 'UNCONFIGURED (Fallback active)'}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
