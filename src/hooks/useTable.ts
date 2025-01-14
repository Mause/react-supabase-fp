import { useSupabase } from './useSupabase';
import * as TE from 'fp-ts/TaskEither';
import { constant, flow, identity, pipe } from 'fp-ts/lib/function';
import { useEffect } from 'react';

import * as RD from '@devexperts/remote-data-ts';
import { useStable } from 'fp-ts-react-stable-hooks';
import * as S from 'fp-ts/string';
import * as E from 'fp-ts/Eq';
import { Filter } from '../types';
import { promiseLikeToTask, queryToTE } from '../utils';

/**
 * Gets many rows from a supabase table.
 * @example
 * ```tsx
 * const filter = useFilter<Foo>((query) => query.gt("id", "5"));
 * const result = useTable<Foo>("foo", "id, bar", filter);
 * pipe(
 *   result,
 *   RD.fold3(
 *     () => <div>Loading...</div>,
 *     (e) => <div>Error {e}</div>,
 *     (rows) => (
 *       <div>
 *         {rows.map((row) => (
 *           <div key={row.id}>{row.bar}</div>
 *         ))}
 *       </div>
 *     )
 *   )
 * );
 * ```
 * @param tableName - The table name to get rows from
 * @param selectArgs - Arguments for a select query
 * @param filter - A filter for your query
 * @param eq - An Eq for your data type
 * @returns Rows that match your filter, or all rows if there is no filter
 */
export const useTable = <T = unknown>(
  tableName: string,
  selectArgs = '*',
  filter?: Filter<T>,
  eq: E.Eq<readonly T[]> = E.eqStrict
): RD.RemoteData<string, readonly T[]> => {
  const supabase = useSupabase();

  const [result, setResult] = useStable<RD.RemoteData<string, readonly T[]>>(
    RD.pending,
    RD.getEq(S.Eq, eq)
  );

  useEffect(() => {
    // TODO: Make this a callback and add a re-execute function
    pipe(
      supabase,
      TE.fromOption(constant('You must use useTable with a Provider!')),
      TE.map(supabase => supabase.from<T>(tableName).select(selectArgs)),
      TE.map(filter || identity),
      TE.chainTaskK(promiseLikeToTask),
      TE.chain(queryToTE)
    )().then(flow(RD.fromEither, setResult));
  }, []);

  return result;
};
