import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#050505',
    color: '#f4f4f5',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    overflow: 'auto',
    background: 'linear-gradient(180deg, #09090c 0%, #030304 100%)',
  },
  content: {
    flex: 1,
    padding: '2rem',
    position: 'relative',
  },
};

const Layout = () => {
  return (
    <div style={styles.wrapper} className="selection-red font-inter">
      <Sidebar />
      <div style={styles.main}>
        <Navbar />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
