/** Composable, parameterized SQL fragments. Interpolated values are always bound, never inlined. */
export interface Fragment { readonly sql: string; readonly params: unknown[]; readonly fragment: true }

export function sql(strings: TemplateStringsArray, ...values: unknown[]): Fragment {
  let text = strings[0];
  const params: unknown[] = [];
  values.forEach((value, i) => {
    if (isFragment(value)) { text += value.sql; params.push(...value.params); }
    else { text += "?"; params.push(value); }
    text += strings[i + 1];
  });
  return { sql: text, params, fragment: true };
}

/** Trusted SQL text (identifiers or literals computed by this module), never user input. */
export function raw(text: string): Fragment { return { sql: text, params: [], fragment: true }; }

export function isFragment(value: unknown): value is Fragment {
  return !!value && typeof value === "object" && (value as Fragment).fragment === true;
}

export function prepare(db: D1Database, query: Fragment): D1PreparedStatement {
  return db.prepare(query.sql).bind(...query.params);
}
