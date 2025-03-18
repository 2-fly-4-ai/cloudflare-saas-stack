import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);import bannerUrl from 'url';const __dirname = bannerUrl.fileURLToPath(new URL('.', import.meta.url));

// node_modules/@opennextjs/cloudflare/dist/api/config.js
function defineCloudflareConfig(options = {}) {
  const { incrementalCache, tagCache, queue } = options;
  return {
    default: {
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        incrementalCache: resolveOverride(incrementalCache),
        tagCache: resolveOverride(tagCache),
        queue: resolveOverride(queue)
      }
    },
    middleware: {
      external: true,
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
        proxyExternalRequest: "fetch"
      }
    }
  };
}
function resolveOverride(value) {
  if (!value || value === "dummy") {
    return "dummy";
  }
  if (value === "direct") {
    return "direct";
  }
  return typeof value === "function" ? value : () => value;
}

// node_modules/@opennextjs/aws/dist/utils/error.js
var IgnorableError = class extends Error {
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 0;
  constructor(message) {
    super(message);
    this.name = "IgnorableError";
  }
};
var RecoverableError = class extends Error {
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 1;
  constructor(message) {
    super(message);
    this.name = "RecoverableError";
  }
};

// node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.js
var cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
function getCloudflareContext(options = { async: false }) {
  return options.async ? getCloudflareContextAsync() : getCloudflareContextSync();
}
function getCloudflareContextFromGlobalScope() {
  const global = globalThis;
  return global[cloudflareContextSymbol];
}
function inSSG() {
  const global = globalThis;
  return global.__NEXT_DATA__?.nextExport === true;
}
function getCloudflareContextSync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  if (inSSG()) {
    throw new Error(`

ERROR: \`getCloudflareContext\` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:
  - make sure that the call is not at the top level and that the route is not static
  - call \`getCloudflareContext({async: true})\` to use the \`async\` mode
  - avoid calling \`getCloudflareContext\` in the route
`);
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function getCloudflareContextAsync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  const inNodejsRuntime = process.env.NEXT_RUNTIME === "nodejs";
  if (inNodejsRuntime || inSSG()) {
    const cloudflareContext2 = await getCloudflareContextFromWrangler();
    addCloudflareContextToNodejsGlobal(cloudflareContext2);
    return cloudflareContext2;
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
function addCloudflareContextToNodejsGlobal(cloudflareContext) {
  const global = globalThis;
  global[cloudflareContextSymbol] = cloudflareContext;
}
async function getCloudflareContextFromWrangler() {
  const { getPlatformProxy } = await import(
    /* webpackIgnore: true */
    `${"__wrangler".replaceAll("_", "")}`
  );
  const { env, cf, ctx } = await getPlatformProxy({
    // This allows the selection of a wrangler environment while running in next dev mode
    environment: process.env.NEXT_DEV_WRANGLER_ENV
  });
  return {
    env,
    cf,
    ctx
  };
}
var initOpenNextCloudflareForDevErrorMsg = `

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;

// node_modules/@opennextjs/cloudflare/dist/api/kv-cache.js
var CACHE_ASSET_DIR = "cdn-cgi/_next_cache";
var STATUS_DELETED = 1;
var Cache = class {
  name = "cloudflare-kv";
  async get(key, isFetch) {
    const cfEnv = getCloudflareContext().env;
    const kv = cfEnv.NEXT_CACHE_WORKERS_KV;
    const assets = cfEnv.ASSETS;
    if (!(kv || assets)) {
      throw new IgnorableError(`No KVNamespace nor Fetcher`);
    }
    this.debug(`Get ${key}`);
    try {
      let entry = null;
      if (kv) {
        this.debug(`- From KV`);
        const kvKey = this.getKVKey(key, isFetch);
        entry = await kv.get(kvKey, "json");
        if (entry?.status === STATUS_DELETED) {
          return null;
        }
      }
      if (!entry && assets) {
        this.debug(`- From Assets`);
        const url = this.getAssetUrl(key, isFetch);
        const response = await assets.fetch(url);
        if (response.ok) {
          entry = {
            value: await response.json(),
            // __BUILD_TIMESTAMP_MS__ is injected by ESBuild.
            lastModified: globalThis.__BUILD_TIMESTAMP_MS__
          };
        }
        if (!kv) {
          if (entry?.value && "kind" in entry.value && entry.value.kind === "FETCH" && entry.value.data?.headers?.expires) {
            const expiresTime = new Date(entry.value.data.headers.expires).getTime();
            if (!isNaN(expiresTime) && expiresTime <= Date.now()) {
              this.debug(`found expired entry (expire time: ${entry.value.data.headers.expires})`);
              return null;
            }
          }
        }
      }
      this.debug(entry ? `-> hit` : `-> miss`);
      return { value: entry?.value, lastModified: entry?.lastModified };
    } catch {
      throw new RecoverableError(`Failed to get cache [${key}]`);
    }
  }
  async set(key, value, isFetch) {
    const kv = getCloudflareContext().env.NEXT_CACHE_WORKERS_KV;
    if (!kv) {
      throw new IgnorableError(`No KVNamespace`);
    }
    this.debug(`Set ${key}`);
    try {
      const kvKey = this.getKVKey(key, isFetch);
      await kv.put(kvKey, JSON.stringify({
        value,
        // Note: `Date.now()` returns the time of the last IO rather than the actual time.
        //       See https://developers.cloudflare.com/workers/reference/security-model/
        lastModified: Date.now()
      }));
    } catch {
      throw new RecoverableError(`Failed to set cache [${key}]`);
    }
  }
  async delete(key) {
    const kv = getCloudflareContext().env.NEXT_CACHE_WORKERS_KV;
    if (!kv) {
      throw new IgnorableError(`No KVNamespace`);
    }
    this.debug(`Delete ${key}`);
    try {
      const kvKey = this.getKVKey(
        key,
        /* isFetch= */
        false
      );
      await kv.put(kvKey, JSON.stringify({ status: STATUS_DELETED }));
    } catch {
      throw new RecoverableError(`Failed to delete cache [${key}]`);
    }
  }
  getKVKey(key, isFetch) {
    return `${this.getBuildId()}/${key}.${isFetch ? "fetch" : "cache"}`;
  }
  getAssetUrl(key, isFetch) {
    return isFetch ? `http://assets.local/${CACHE_ASSET_DIR}/__fetch/${this.getBuildId()}/${key}` : `http://assets.local/${CACHE_ASSET_DIR}/${this.getBuildId()}/${key}.cache`;
  }
  debug(...args) {
    if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
      console.log(`[Cache ${this.name}] `, ...args);
    }
  }
  getBuildId() {
    return process.env.NEXT_BUILD_ID ?? "no-build-id";
  }
};
var kv_cache_default = new Cache();

// open-next.config.ts
var open_next_config_default = defineCloudflareConfig({
  incrementalCache: kv_cache_default
});
export {
  open_next_config_default as default
};
