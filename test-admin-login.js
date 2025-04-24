const bcrypt = require('bcrypt');

// The hashed password from your database
const hashedPassword = '$2b$10$X9f5/ViB/sm3HBQlmfoUuOWA7W8Md9iauU3pJkyN5NCwDGg05oipy';

// The password to test (admin123)
const testPassword = 'admin123';

// Compare the password
bcrypt.compare(testPassword, hashedPassword, (err, result) => {
  if (err) {
    console.error('Error comparing passwords:', err);
    return;
  }
  
  if (result) {
    console.log('Password match: TRUE - The admin123 password is correct!');
  } else {
    console.log('Password match: FALSE - The password is incorrect!');
  }
});

// Generate a new hash for admin123 for comparison
bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('New hash for admin123:', hash);
  console.log('Old hash in database:', hashedPassword);
}); 