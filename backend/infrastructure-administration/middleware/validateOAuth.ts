import { OAuth2Client } from 'google-auth-library';

// Initialize the OAuth2Client
const client = new OAuth2Client();

// Middleware to verify the token
async function verifyAuthToken(req, res, next) {
  try {
    // Get the Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ error: 'Authorization token missing or malformed' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'http://localhost:8083' // TODO: Replace with your own audience and write it to .env
    });

    // Get the payload (decoded token data)
    const payload = ticket.getPayload();

    // Add the payload (user info) to the request object
    req.user = payload;

    console.log('Verified user:', payload);

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).send({ error: 'Unauthorized' });
  }
}

export default verifyAuthToken;