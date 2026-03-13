import dotenv from 'dotenv';
import neo4j, { Driver } from 'neo4j-driver';
dotenv.config();

export class Neo4JClient {
  private static instance: Driver

  public static getInstance(): Driver {
    if (!this.instance) {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const user = process.env.NEO4J_USER || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'password';

      this.instance = neo4j.driver(uri, neo4j.auth.basic(user, password));
      console.log('Neo4j Driver connected.');
    }
    return this.instance
  }

  public static async close() {
    if (this.instance) {
      await this.instance.close()
    }
  }
}

const test = () => {
  console.log('first');
}
