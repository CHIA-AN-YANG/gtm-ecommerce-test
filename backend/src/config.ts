export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d',
  },
  bcrypt: {
    saltRounds: 10,
  },
};
