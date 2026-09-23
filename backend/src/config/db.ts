import mongoose from 'mongoose';

let isConnecting = false;

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    let uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('[DB] MONGO_URI is not defined in environment variables.');
      isConnecting = false;
      return;
    }

    // Clean leading/trailing quotes or spaces (common when pasting env vars in Render/Vercel)
    uri = uri.trim().replace(/^["']|["']$/g, '');

    // Ensure database name is included if omitted
    if (uri.includes('mongodb.net/?')) {
      uri = uri.replace('mongodb.net/?', 'mongodb.net/constructor_erp?');
    } else if (uri.endsWith('mongodb.net') || uri.endsWith('mongodb.net/')) {
      uri = uri.replace(/\/+$/, '') + '/constructor_erp';
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[DB] MongoDB Atlas connected successfully to host: ${conn.connection.host}`);
    isConnecting = false;
  } catch (err: any) {
    isConnecting = false;
    console.error(`[DB] Connection error: ${err.message}`);
    console.error(
      '[DB] Troubleshooting checklist:\n' +
        '  1. Remove literal quote marks ("") around MONGO_URI value in Render Environment Variables.\n' +
        '  2. In MongoDB Atlas -> Network Access, add IP "0.0.0.0/0" (Allow Access from Anywhere).\n' +
        '  3. Verify database user username & password in MONGO_URI.\n' +
        '  4. Ensure your Atlas cluster is active (not paused).'
    );

    // Schedule background retry in 10 seconds without crashing the Express process
    setTimeout(connectDB, 10000);
  }
};

export default connectDB;
