import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from "axios";
import { CreateTenantRequestObject } from "../../../shared/CreateTenantRequestObject";

const AUTHENTICATION_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;

const SignupPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [userName, setUserName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!planId){
      console.error("Plan Id not set");
      return;
    }
    
    const request : CreateTenantRequestObject = {
      name: tenantName,
      type: planId,
      subdomain: subdomain.toLowerCase(),
      adminMail: email,
      adminName: userName,
      adminPassword: password
    }

    axios.post(`${AUTHENTICATION_URL}/tenants/add`, request)
    .then(() => {
      navigate('/signup/success');
    })
    .catch(function (error) {
      if (error.response && error.response.status === 409) {
        setError(error.response.data);
        
      } else {
        console.error('Error', error.message);
        setError("Error creating tenant");
      }
    });
  };

  return (
    <Box sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h1" align="center" gutterBottom>
        Sign Up
      </Typography>
      <Typography variant="h2" align="center" gutterBottom>
        {planId} Plan
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tenant Name"
          type="text"
          fullWidth
          margin="normal"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
        />
        { planId === "enterprise" && 
          <TextField
            label="Subdomain"
            type="text"
            fullWidth
            margin="normal"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            required
          />
        }
        <TextField
          label="User Name"
          type="text"
          fullWidth
          margin="normal"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Sign Up
        </Button>
      </form>
      {error && (
        <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default SignupPage;
