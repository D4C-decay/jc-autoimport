export interface DatabaseConfig {
  url: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface Argon2Config {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
}

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  currency: string;
}

export interface RateLimitConfig {
  globalTtl: number;
  globalLimit: number;
  authTtl: number;
  authLimit: number;
}

export interface EncryptionConfig {
  /** 64-char hex (32 bytes) or any passphrase (hashed to 32 bytes). */
  key: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  /** Interface the API binds to. 127.0.0.1 keeps it off the local network. */
  host: string;
  name: string;
  url: string;
  /** Public URL of the web frontend, used for links sent by email. */
  webUrl: string;
  corsOrigins: string[];
}
