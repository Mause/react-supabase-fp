import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Provider,
  useDelete,
  useFilter,
  useSingle,
  useTable,
  useUpsert,
} from '../.';
import { createClient } from '@supabase/supabase-js';
import * as RD from '@devexperts/remote-data-ts';
import { constant, pipe } from 'fp-ts/lib/function';
import { definitions } from './types/supabase';

const App = () => {
  const client = createClient(
    'https://uxtxhzqpveqocjohidmf.supabase.co',
    process.env.SUPABASE_ANON_KEY!
  );

  return (
    <Provider value={client}>
      <Consumer />
    </Provider>
  );
};

const Consumer = () => {
  const filter = useFilter<definitions['test']>(query => query.eq('id', 2));
  const [result, execute] = useDelete<definitions['test']>('test');
  return pipe(
    result,
    RD.fold(
      constant(
        <div>
          <button onClick={() => execute(filter)}>DELETE ID 2</button>
        </div>
      ),
      constant(<div>Loading...</div>),
      e => <div>Fucken failed: {e}</div>,
      result => {
        return <div>Bye bye :D</div>;
      }
    )
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
