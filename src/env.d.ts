/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        ACCESS_CODE: string;
      };
      cf: CfProperties;
      ctx: ExecutionContext;
    };
  }
}
