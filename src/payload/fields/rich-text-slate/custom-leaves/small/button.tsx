import { LeafButton } from '@payloadcms/richtext-slate';
import React from 'react';

export const ButtonSmall = () => (
  <span title="small">
    <LeafButton format="small">
      <svg fill="currentColor" viewBox="0 0 20 20" width={20}>
        <path d="M16 9v8h-2V9h-4V7h10v2h-4zM8 5v12H6V5H0V3h15v2H8z" />
      </svg>
    </LeafButton>
  </span>
);
