import React from 'react';

export function FooterTest() {
  return (
    <div 
      style={{
        position: 'fixed',
        left: '0',
        right: '0',
        bottom: '0',
        height: '120px',
        backgroundColor: '#00ff00',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '5px solid #ff0000',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ color: 'black', fontSize: '16px', fontWeight: 'bold' }}>
        FOOTER TEST - HEIGHT: 120px - Z-INDEX: 30
      </div>
    </div>
  );
}
