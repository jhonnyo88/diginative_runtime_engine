// Expert specification: Multi-tenant Database Sharding Architecture
// Implementation för 10K+ concurrent users med complete tenant isolation

export interface ShardingStrategy {
  // Expert recommendation: Tenant-based sharding
  shard_key: 'tenant_id';
  shard_count: 16; // Start with 16, scale to 64
  
  // Expert specification: Shard distribution
  shard_distribution: {
    malmö_stad: 'shard_001'; // Large tenants get dedicated shards
    stockholm_stad: 'shard_002';
    göteborg_stad: 'shard_003';
    german_municipalities: 'shard_004_008'; // German cultural context shards
    french_municipalities: 'shard_009_012'; // French cultural context shards  
    dutch_municipalities: 'shard_013_015'; // Dutch cultural context shards
    small_municipalities: 'shard_016'; // Shared shard för smaller tenants
  };
  
  // Expert requirement: Cross-shard analytics
  analytics_strategy: {
    aggregation_method: 'read_only_replicas';
    reporting_database: 'separate_data_warehouse';
    etl_pipeline: 'real_time_streaming';
  };
}

// Expert implementation: Tenant Shard Manager
export class TenantShardManager {
  private shardConnections: Map<string, DatabaseConnection> = new Map();
  private tenantShardMapping: Map<string, string> = new Map();
  private shardConfigurations: Map<string, ShardConfig> = new Map();

  constructor() {
    this.initializeShardMapping();
    this.setupShardConnections();
  }

  private initializeShardMapping() {
    // Expert specification: Cultural-aware shard distribution
    
    // Swedish municipalities (optimized för Anna Svensson)
    this.tenantShardMapping.set('malmo_stad', 'shard_001');
    this.tenantShardMapping.set('stockholm_stad', 'shard_002'); 
    this.tenantShardMapping.set('goteborg_stad', 'shard_003');
    
    // German municipalities (optimized för Klaus Mueller)
    this.tenantShardMapping.set('berlin_de', 'shard_004');
    this.tenantShardMapping.set('munich_de', 'shard_005');
    this.tenantShardMapping.set('hamburg_de', 'shard_006');
    this.tenantShardMapping.set('cologne_de', 'shard_007');
    this.tenantShardMapping.set('german_small_municipalities', 'shard_008');
    
    // French municipalities (optimized för Marie Dubois)
    this.tenantShardMapping.set('paris_fr', 'shard_009');
    this.tenantShardMapping.set('lyon_fr', 'shard_010');
    this.tenantShardMapping.set('marseille_fr', 'shard_011');
    this.tenantShardMapping.set('french_small_municipalities', 'shard_012');
    
    // Dutch municipalities (optimized för Pieter van Berg)
    this.tenantShardMapping.set('amsterdam_nl', 'shard_013');
    this.tenantShardMapping.set('rotterdam_nl', 'shard_014');
    this.tenantShardMapping.set('dutch_small_municipalities', 'shard_015');
    
    // Shared shard för very small municipalities
    this.tenantShardMapping.set('small_municipalities_shared', 'shard_016');
  }

  private setupShardConnections() {
    // Expert configuration: PostgreSQL sharding setup
    for (let i = 1; i <= 16; i++) {
      const shardId = `shard_${i.toString().padStart(3, '0')}`;
      
      this.shardConfigurations.set(shardId, {
        host: process.env[`SHARD_${i}_HOST`] || 'localhost',
        port: parseInt(process.env[`SHARD_${i}_PORT`] || '5432'),
        database: `diginativa_${shardId}`,
        username: process.env[`SHARD_${i}_USER`] || 'postgres',
        password: process.env[`SHARD_${i}_PASSWORD`],
        
        // Expert requirement: Performance optimization per shard
        pool_config: {
          min: 5,
          max: 50, // 50 connections per shard = 800 total
          idle_timeout: 30000,
          connection_timeout: 2000
        },
        
        // Expert specification: Row-level security
        row_level_security: true,
        tenant_isolation_policy: `tenant_id = current_setting('app.current_tenant')`,
        
        // Cultural optimization per shard
        cultural_optimization: this.getCulturalOptimizationForShard(shardId)
      });
    }
  }

  // Expert implementation: Tenant-aware query routing
  async routeQuery(
    tenantId: string, 
    query: string, 
    params: any[] = []
  ): Promise<QueryResult> {
    try {
      const shardId = this.getShardForTenant(tenantId);
      const connection = await this.getShardConnection(shardId);
      
      // Expert requirement: Set tenant context för row-level security
      await connection.query(`SET app.current_tenant = '${tenantId}'`);
      
      // Execute query with performance tracking
      const startTime = performance.now();
      const result = await connection.query(query, params);
      const executionTime = performance.now() - startTime;
      
      // Expert monitoring: Track query performance per cultural context
      await this.trackQueryPerformance(tenantId, shardId, executionTime, query);
      
      return result;
    } catch (error) {
      console.error(`Query routing failed för tenant ${tenantId}:`, error);
      throw new ShardingError(`Database query failed för tenant: ${tenantId}`);
    }
  }

  // Expert implementation: Cross-shard analytics
  async handleCrossShardAnalytics(
    tenantIds: string[], 
    analyticsQuery: string
  ): Promise<AnalyticsResult> {
    try {
      // Expert strategy: Route to read-only analytics replicas
      const involvedShards = tenantIds.map(id => this.getShardForTenant(id));
      const uniqueShards = [...new Set(involvedShards)];
      
      const shardResults = await Promise.all(
        uniqueShards.map(shardId => 
          this.executeAnalyticsQuery(shardId, analyticsQuery, tenantIds)
        )
      );
      
      // Expert aggregation: Combine results från multiple shards
      return this.aggregateShardResults(shardResults);
    } catch (error) {
      console.error('Cross-shard analytics failed:', error);
      throw new ShardingError('Analytics query failed across shards');
    }
  }

  private getShardForTenant(tenantId: string): string {
    const shardId = this.tenantShardMapping.get(tenantId);
    
    if (!shardId) {
      // Expert fallback: Route unknown tenants to shared shard
      console.warn(`Unknown tenant ${tenantId}, routing to shared shard`);
      return 'shard_016';
    }
    
    return shardId;
  }

  private async getShardConnection(shardId: string): Promise<DatabaseConnection> {
    let connection = this.shardConnections.get(shardId);
    
    if (!connection) {
      const config = this.shardConfigurations.get(shardId)!;
      connection = await this.createShardConnection(config);
      this.shardConnections.set(shardId, connection);
    }
    
    return connection;
  }

  private async createShardConnection(config: ShardConfig): Promise<DatabaseConnection> {
    // Expert implementation: PostgreSQL connection with optimization
    const { Pool } = await import('pg');
    
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      
      // Expert optimization: Connection pooling per shard
      min: config.pool_config.min,
      max: config.pool_config.max,
      idleTimeoutMillis: config.pool_config.idle_timeout,
      connectionTimeoutMillis: config.pool_config.connection_timeout,
      
      // Expert requirement: Cultural performance optimization
      statement_timeout: this.getStatementTimeoutForCulture(config.cultural_optimization),
      query_timeout: this.getQueryTimeoutForCulture(config.cultural_optimization)
    });
    
    // Expert setup: Row-level security
    if (config.row_level_security) {
      await this.setupRowLevelSecurity(pool, config.tenant_isolation_policy);
    }
    
    return pool;
  }

  private getCulturalOptimizationForShard(shardId: string): CulturalOptimization {
    // Expert mapping: Cultural optimization per shard group
    if (shardId.startsWith('shard_001') || shardId.startsWith('shard_002') || shardId.startsWith('shard_003')) {
      return 'swedish_mobile'; // Anna Svensson optimization
    } else if (shardId.startsWith('shard_004') || shardId.startsWith('shard_005') || 
               shardId.startsWith('shard_006') || shardId.startsWith('shard_007') || 
               shardId.startsWith('shard_008')) {
      return 'german_systematic'; // Klaus Mueller optimization
    } else if (shardId.startsWith('shard_009') || shardId.startsWith('shard_010') || 
               shardId.startsWith('shard_011') || shardId.startsWith('shard_012')) {
      return 'french_collaborative'; // Marie Dubois optimization
    } else if (shardId.startsWith('shard_013') || shardId.startsWith('shard_014') || 
               shardId.startsWith('shard_015')) {
      return 'dutch_progressive'; // Pieter van Berg optimization
    } else {
      return 'mixed_cultural'; // Shared shard
    }
  }

  private getStatementTimeoutForCulture(culture: CulturalOptimization): number {
    // Expert tuning: Cultural performance preferences
    switch (culture) {
      case 'german_systematic':
        return 30000; // Germans accept longer queries för detailed data
      case 'french_collaborative':
        return 20000; // Balanced timeout för collaborative workflows
      case 'dutch_progressive':
        return 10000; // Dutch demand fast, efficient queries
      case 'swedish_mobile':
        return 15000; // Mobile-optimized timeouts för Anna
      default:
        return 20000; // Balanced default
    }
  }

  private getQueryTimeoutForCulture(culture: CulturalOptimization): number {
    // Expert tuning: Query timeout per cultural expectation
    switch (culture) {
      case 'german_systematic':
        return 45000; // Comprehensive queries acceptable
      case 'french_collaborative':
        return 30000; // Moderate timeout för collaboration
      case 'dutch_progressive':
        return 15000; // Fast queries för efficiency
      case 'swedish_mobile':
        return 20000; // Mobile-appropriate timeouts
      default:
        return 30000;
    }
  }

  private async setupRowLevelSecurity(pool: DatabaseConnection, policy: string): Promise<void> {
    // Expert implementation: PostgreSQL row-level security setup
    await pool.query(`
      -- Enable row-level security on all tenant tables
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE games ENABLE ROW LEVEL SECURITY;
      ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
      ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
      
      -- Create tenant isolation policies
      CREATE POLICY tenant_isolation_users ON users
        USING (${policy});
        
      CREATE POLICY tenant_isolation_games ON games  
        USING (${policy});
        
      CREATE POLICY tenant_isolation_progress ON progress
        USING (${policy});
        
      CREATE POLICY tenant_isolation_analytics ON analytics
        USING (${policy});
    `);
  }

  private async executeAnalyticsQuery(
    shardId: string, 
    query: string, 
    tenantIds: string[]
  ): Promise<ShardAnalyticsResult> {
    const connection = await this.getShardConnection(shardId);
    const tenantFilter = tenantIds.map(id => `'${id}'`).join(',');
    
    // Expert modification: Add tenant filter to analytics query
    const filteredQuery = query.replace(
      'WHERE', 
      `WHERE tenant_id IN (${tenantFilter}) AND`
    );
    
    const result = await connection.query(filteredQuery);
    
    return {
      shardId,
      data: result.rows,
      tenantCount: tenantIds.length,
      executionTime: performance.now()
    };
  }

  private aggregateShardResults(results: ShardAnalyticsResult[]): AnalyticsResult {
    // Expert aggregation: Combine results from multiple shards
    const aggregatedData = results.reduce((acc, result) => {
      return acc.concat(result.data);
    }, []);
    
    const totalExecutionTime = Math.max(...results.map(r => r.executionTime));
    const totalTenants = results.reduce((sum, r) => sum + r.tenantCount, 0);
    
    return {
      data: aggregatedData,
      metadata: {
        shardsInvolved: results.length,
        totalTenants,
        executionTime: totalExecutionTime,
        culturalDistribution: this.calculateCulturalDistribution(results)
      }
    };
  }

  private calculateCulturalDistribution(results: ShardAnalyticsResult[]): CulturalDistribution {
    const distribution = {
      swedish_mobile: 0,
      german_systematic: 0,
      french_collaborative: 0,
      dutch_progressive: 0,
      mixed_cultural: 0
    };
    
    results.forEach(result => {
      const culture = this.getCulturalOptimizationForShard(result.shardId);
      distribution[culture]++;
    });
    
    return distribution;
  }

  private async trackQueryPerformance(
    tenantId: string, 
    shardId: string, 
    executionTime: number, 
    query: string
  ): Promise<void> {
    // Expert monitoring: Cultural performance tracking
    const culturalContext = this.getCulturalOptimizationForShard(shardId);
    
    const performanceData = {
      tenantId,
      shardId,
      culturalContext,
      executionTime,
      queryType: this.categorizeQuery(query),
      timestamp: new Date().toISOString()
    };
    
    // Send to monitoring service (implementation specific)
    await this.sendToMonitoring(performanceData);
  }

  private categorizeQuery(query: string): string {
    if (query.toLowerCase().includes('select')) return 'read';
    if (query.toLowerCase().includes('insert')) return 'write';
    if (query.toLowerCase().includes('update')) return 'update';
    if (query.toLowerCase().includes('delete')) return 'delete';
    return 'other';
  }

  private async sendToMonitoring(data: any): Promise<void> {
    // Expert monitoring integration
    console.log('Performance tracking:', data);
    // Implementation: Send to monitoring service
  }

  // Expert method: Shard health monitoring
  async getShardHealthStatus(): Promise<ShardHealthReport> {
    const healthReports = await Promise.all(
      Array.from(this.shardConfigurations.keys()).map(async (shardId) => {
        try {
          const connection = await this.getShardConnection(shardId);
          const healthQuery = 'SELECT NOW() as timestamp, version() as version';
          const result = await connection.query(healthQuery);
          
          return {
            shardId,
            status: 'healthy',
            responseTime: performance.now(),
            lastCheck: result.rows[0].timestamp,
            version: result.rows[0].version,
            culturalOptimization: this.getCulturalOptimizationForShard(shardId)
          };
        } catch (error) {
          return {
            shardId,
            status: 'unhealthy',
            error: error.message,
            culturalOptimization: this.getCulturalOptimizationForShard(shardId)
          };
        }
      })
    );
    
    return {
      totalShards: this.shardConfigurations.size,
      healthyShards: healthReports.filter(r => r.status === 'healthy').length,
      unhealthyShards: healthReports.filter(r => r.status === 'unhealthy').length,
      shardDetails: healthReports,
      culturalDistribution: this.calculateHealthyCulturalDistribution(healthReports)
    };
  }

  private calculateHealthyCulturalDistribution(reports: any[]): CulturalDistribution {
    const healthyReports = reports.filter(r => r.status === 'healthy');
    const distribution = {
      swedish_mobile: 0,
      german_systematic: 0, 
      french_collaborative: 0,
      dutch_progressive: 0,
      mixed_cultural: 0
    };
    
    healthyReports.forEach(report => {
      distribution[report.culturalOptimization]++;
    });
    
    return distribution;
  }
}

// Expert type definitions
type CulturalOptimization = 'swedish_mobile' | 'german_systematic' | 'french_collaborative' | 'dutch_progressive' | 'mixed_cultural';

interface ShardConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  pool_config: {
    min: number;
    max: number;
    idle_timeout: number;
    connection_timeout: number;
  };
  row_level_security: boolean;
  tenant_isolation_policy: string;
  cultural_optimization: CulturalOptimization;
}

interface DatabaseConnection {
  query(text: string, params?: any[]): Promise<QueryResult>;
}

interface QueryResult {
  rows: any[];
  rowCount: number;
}

interface ShardAnalyticsResult {
  shardId: string;
  data: any[];
  tenantCount: number;
  executionTime: number;
}

interface AnalyticsResult {
  data: any[];
  metadata: {
    shardsInvolved: number;
    totalTenants: number;
    executionTime: number;
    culturalDistribution: CulturalDistribution;
  };
}

interface CulturalDistribution {
  swedish_mobile: number;
  german_systematic: number;
  french_collaborative: number;
  dutch_progressive: number;
  mixed_cultural: number;
}

interface ShardHealthReport {
  totalShards: number;
  healthyShards: number;
  unhealthyShards: number;
  shardDetails: any[];
  culturalDistribution: CulturalDistribution;
}

class ShardingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShardingError';
  }
}