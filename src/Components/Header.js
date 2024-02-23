// Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  const linkStyle = {
    color: 'white', // Set the link color to white
    textDecoration: 'none', // Remove default underline
    marginLeft: '20px', // Add spacing between links
  };
  
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6">
          <MuiLink component={RouterLink} to="/" style={linkStyle}>
            Object Detection
          </MuiLink>
        </Typography>
        <Typography variant="h6">
          <MuiLink component={RouterLink} to="/camera" style={linkStyle}>
            Camera
          </MuiLink>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;

