/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_artifacts from "../ai/artifacts.js";
import type * as ai_commands from "../ai/commands.js";
import type * as ai_embeddings from "../ai/embeddings.js";
import type * as ai_prompts from "../ai/prompts.js";
import type * as ai_retrieval from "../ai/retrieval.js";
import type * as ai_workers from "../ai/workers.js";
import type * as conversations from "../conversations.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as reactions from "../reactions.js";
import type * as search_semanticSearch from "../search/semanticSearch.js";
import type * as search_similarity from "../search/similarity.js";
import type * as services_llm from "../services/llm.js";
import type * as typing from "../typing.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/artifacts": typeof ai_artifacts;
  "ai/commands": typeof ai_commands;
  "ai/embeddings": typeof ai_embeddings;
  "ai/prompts": typeof ai_prompts;
  "ai/retrieval": typeof ai_retrieval;
  "ai/workers": typeof ai_workers;
  conversations: typeof conversations;
  messages: typeof messages;
  presence: typeof presence;
  reactions: typeof reactions;
  "search/semanticSearch": typeof search_semanticSearch;
  "search/similarity": typeof search_similarity;
  "services/llm": typeof services_llm;
  typing: typeof typing;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
