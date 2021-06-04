import { useSupabase } from './useSupabase';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';
import * as RD from '@devexperts/remote-data-ts';

export const useTable = <T = any>(
  tableName: string
): RD.RemoteData<string, T[]> => {
  const supabase = useSupabase();

  const [result, setResult] = useState<RD.RemoteData<string, T[]>>(RD.pending);

  useEffect(() => {
    pipe(
      supabase,
      TE.fromOption(() => 'You must use useTable with a Provider!'),
      TE.chainTaskK(supabase => async () =>
        await supabase.from<T>(tableName).select()
      ),
      TE.chain(({ data, error }) => {
        if (error)
          return TE.left(`${error.message} - ${error.details} - ${error.hint}`);
        else return TE.right(data!);
      })
    )().then(result => setResult(RD.fromEither(result)));
  }, []);

  return result;
};
