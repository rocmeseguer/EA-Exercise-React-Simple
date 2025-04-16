import React, { useState } from 'react';

export function Home(): JSX.Element {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <h1>Home Page</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
