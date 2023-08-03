import React from 'react';
import { createRoot } from 'react-dom/client';
import { Demo } from './views/Demo';

const root = createRoot(document.getElementById('root') ?? document.body);
root.render(<Demo/>);
