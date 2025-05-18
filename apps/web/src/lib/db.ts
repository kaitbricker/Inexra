import { PrismaClient } from '@prisma/client';
import { productionConfig } from '@/config/production';

class DatabaseManager {
  private static instance: DatabaseManager;
  private writeClient: PrismaClient;
  private readClients: PrismaClient[];
  private currentReadIndex: number = 0;

  private constructor() {
    // Initialize write client with connection pooling
    this.writeClient = new PrismaClient({
      datasources: {
        db: {
          url: productionConfig.database.url,
        },
      },
      log: ['error', 'warn'],
    });

    // Initialize read replicas if configured
    const readReplicaUrls = process.env.DATABASE_READ_REPLICA_URLS?.split(',') || [];
    this.readClients = readReplicaUrls.map(
      (url) =>
        new PrismaClient({
          datasources: {
            db: {
              url,
            },
          },
          log: ['error', 'warn'],
        })
    );

    // If no read replicas, use write client for reads
    if (this.readClients.length === 0) {
      this.readClients = [this.writeClient];
    }
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Get write client for mutations
  getWriteClient(): PrismaClient {
    return this.writeClient;
  }

  // Get read client using round-robin load balancing
  getReadClient(): PrismaClient {
    const client = this.readClients[this.currentReadIndex];
    this.currentReadIndex = (this.currentReadIndex + 1) % this.readClients.length;
    return client;
  }

  // Execute a transaction
  async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.writeClient.$transaction(fn);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.writeClient.$queryRaw`SELECT 1`;
      await Promise.all(this.readClients.map((client) => client.$queryRaw`SELECT 1`));
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    await this.writeClient.$disconnect();
    await Promise.all(this.readClients.map((client) => client.$disconnect()));
  }
}

export const db = DatabaseManager.getInstance(); 