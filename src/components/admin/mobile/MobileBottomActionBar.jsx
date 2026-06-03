import React from 'react';
import StickyActionBar from '../../ui/StickyActionBar';

export default function MobileBottomActionBar({ children }) {
  return (
    <StickyActionBar>
      {children}
    </StickyActionBar>
  );
}
