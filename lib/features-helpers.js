/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @fileoverview Contains helpers for parsing Chrome's feature files.
 */


import * as featureTypes from '../types/feature.js';


/**
 * Find the parent name by stripping the last dot-separated part. Returns an empty string if there
 * is no valid parent.
 *
 * @param {string} name
 * @return {string}
 */
export function parentFeatureName(name) {
  const dot = name.lastIndexOf('.');
  if (dot === -1) {
    return '';
  }
  return name.slice(0, dot);
}


/**
 * Provides a set of values, defaulting to the special value 'all', that can be restricted further.
 * 
 * This is useful as we walk the dependencies of a feature, to make a string-set-like more
 * restrictive. As soon as any value is included that is not 'all', we remove it and only allow
 * further subsets of those values.
 *
 * @template T
 */
export class RestrictSet {
  /** @type {Set<T>|null} */
  #contents = null;

  /**
   * Restrict to an additional subset of values. Does nothing if values is falsey.
   *
   * @param {(T | featureTypes.All)[]|undefined} values
   */
  restrict(values) {
    if (!values) {
      return;
    }

    const valueSet = new Set(values);
    if (this.#contents) {
      const c = this.#contents;
      [...c].forEach((cand) => {
        if (!valueSet.has(cand)) {
          c.delete(cand);
        }
      });
      return;
    }

    // If we allow all, and are trying to restrict to all, ... do nothing.
    if (valueSet.has('all')) {
      return;
    }
    this.#contents = /** @type {Set<T>} */ (valueSet);
  }

  /**
   * Returns the current array of allowable values, or 'all' if all are allowed.
   * 
   * @return {(T | featureTypes.All)[]}
   */
  get() {
    return this.#contents ? [...this.#contents] : ['all'];
  }
}