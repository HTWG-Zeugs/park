import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { List, ListItem } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Box sx={{ p: 4, backgroundColor: 'background.default' }}>
      <Typography variant="h1" align="center" gutterBottom color="text.primary">
        Select Your Plan
      </Typography>
      <Card variant="outlined" sx={{ maxWidth: 1080, mx: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
        <Typography gutterBottom variant="h5" component="div">
        Free Plan Description 🚀
        </Typography>
        <Typography gutterBottom variant="h6" component="div">
          0,00€/mo
        </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          With our <strong>Free Plan</strong>, you can get started right away and enjoy the following features:
          <List>
        <ListItem><strong>Create garages</strong>: Set up and manage multiple garages to keep your locations organized.</ListItem>
        <ListItem><strong>Create users</strong>: Add team members and manage user access effortlessly.</ListItem>
        <ListItem><strong>Create defects</strong>: Track and manage defects to ensure quick issue resolution.</ListItem>
        <ListItem><strong>Create eMobility charging stations</strong>: Integrate electric vehicle charging stations and monitor their status across your locations.</ListItem>
          </List>
          The Free Plan gives you all the essential tools to manage your garages and charging stations efficiently! ⚡️
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
        <Button variant="outlined" component={Link} to={`/signup/free`}>Sign Up</Button>
        </Box>
      </Card>

      <br />
      <br />

      <Card variant="outlined" sx={{ maxWidth: 1080, mx: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
        <Typography gutterBottom variant="h5" component="div">
        Premium Plan Description 🌟
        </Typography>
        <Typography gutterBottom variant="h6" component="div">
          79,00€/mo
        </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Unlock the full potential of your platform with our <strong>Premium Plan</strong>, offering enhanced features and improved capabilities:
          <List>
            <ListItem><strong>Create garages</strong>: Manage multiple garage locations seamlessly.</ListItem>  
            <ListItem><strong>Create users</strong>: Add unlimited team members and control access efficiently.</ListItem>  
            <ListItem><strong>Create defects</strong>: Track issues with detailed defect management.</ListItem>  
            <ListItem><strong>Create eMobility charging stations</strong>: Easily integrate and manage EV charging stations across your locations.</ListItem>  
            <ListItem><strong>Multi-language support</strong>: Access the platform in multiple languages to accommodate your global team.</ListItem>  
            <ListItem><strong>Analytics page</strong>: Gain valuable insights with advanced analytics to optimize your operations.</ListItem>  
            <ListItem><strong>Better performance</strong>: Experience faster load times and enhanced system reliability.</ListItem>  
            <ListItem><strong>Better support</strong>: Enjoy priority customer support for quicker assistance.</ListItem>  
            <ListItem><strong>Better security</strong>: Benefit from advanced security features to keep your data safe.</ListItem>
          </List>
          The Premium Plan provides everything you need for efficient, secure, and scalable management of your garages and charging stations. 🚀          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 3 }}>
          <Typography gutterBottom variant="h5">
            Further Pricing Details
          </Typography>
          <Typography gutterBottom variant="body2">
            <List>
            <ListItem><strong>79,90€ per month base price</strong>: Get started with a flat monthly fee.</ListItem>  
            <ListItem><strong>1€ per user</strong>: Pay only for the users you add to your platform.</ListItem>  
            <ListItem><strong>5€ per 10.000 backend requests</strong>: Scale your application usage with affordable request pricing.</ListItem>
            </List>
          </Typography>
          <Button variant="outlined" component={Link} to={`/signup/premium`}>Sign Up</Button>
        </Box>
      </Card>

      <br />
      <br />

      <Card variant="outlined" sx={{ maxWidth: 1080, mx: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography gutterBottom variant="h5" component="div">
              Enterprise Plan 👔
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              129,90€/mo
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            The <strong>Enterprise Plan</strong> is designed for businesses that need the highest level of performance, security, and support. With this plan, you'll gain access to all the core features and premium tools your organization needs to manage operations efficiently:
            <List>
              <ListItem><strong>Create garages</strong>: Seamlessly manage multiple garage locations.</ListItem>
              <ListItem><strong>Create users</strong>: Add unlimited users and control access with ease.</ListItem>
              <ListItem><strong>Create defects</strong>: Track and manage issues to ensure quick resolutions.</ListItem>
              <ListItem><strong>Create eMobility charging stations</strong>: Integrate and manage EV charging stations across locations.</ListItem>
              <ListItem><strong>Multi-language support</strong>: Use the platform in multiple languages for global teams.</ListItem>
              <ListItem><strong>Analytics page</strong>: Get detailed insights to optimize your operations.</ListItem>
              <ListItem><strong>Best performance</strong>: Enjoy the fastest and most reliable experience.</ListItem>
              <ListItem><strong>Best support</strong>: Get top-priority support for fast issue resolution.</ListItem>
              <ListItem><strong>Best security</strong>: Benefit from the highest level of data security and protection.</ListItem>
            </List>
            The Enterprise Plan ensures your organization has the tools to succeed with optimal performance, security, and customer support.💼
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 3 }}>
          <Typography gutterBottom variant="h5">
            Further Pricing Details
          </Typography>
          <Typography gutterBottom variant="body2">
            <List>
              <ListItem><strong>129,90€ per month base price</strong>: Access all features with a flat monthly fee.</ListItem>
              <ListItem><strong>5€ per 10,000 backend requests</strong>: Scale your application usage with affordable request pricing.</ListItem>
            </List>
          </Typography>
          <Button variant="outlined" component={Link} to={`/signup/enterprise`}>Sign Up</Button>
        </Box>
      </Card>
      <br />
    </Box>
  );
};

export default HomePage;
