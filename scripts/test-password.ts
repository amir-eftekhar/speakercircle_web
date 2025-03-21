const bcrypt = require('bcrypt');

async function main() {
  const password = 'password123';
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
  
  // Verify the password
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password valid:', isValid);
  
  // Try an incorrect password
  const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log('Wrong password valid:', isInvalid);
}

main().catch(console.error); 