/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as dodoPayments from "../dodoPayments.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as notes from "../notes.js";
import type * as prompts from "../prompts.js";
import type * as recordings from "../recordings.js";
import type * as router from "../router.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  dodoPayments: typeof dodoPayments;
  folders: typeof folders;
  http: typeof http;
  notes: typeof notes;
  prompts: typeof prompts;
  recordings: typeof recordings;
  router: typeof router;
  settings: typeof settings;
  storage: typeof storage;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
