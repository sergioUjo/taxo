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
import type * as case_classifications from "../case_classifications.js";
import type * as cases from "../cases.js";
import type * as hierarchicalData from "../hierarchicalData.js";
import type * as patients from "../patients.js";
import type * as procedures from "../procedures.js";
import type * as processDocumentDirect from "../processDocumentDirect.js";
import type * as rules from "../rules.js";
import type * as specialties from "../specialties.js";
import type * as treatments from "../treatments.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  case_classifications: typeof case_classifications;
  cases: typeof cases;
  hierarchicalData: typeof hierarchicalData;
  patients: typeof patients;
  procedures: typeof procedures;
  processDocumentDirect: typeof processDocumentDirect;
  rules: typeof rules;
  specialties: typeof specialties;
  treatments: typeof treatments;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
