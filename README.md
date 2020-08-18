## Security features

### Database security
- Password encryption using bcrypt
- Password reset using node's built-in crypto linrary, using SHA256 hashing

### Brute force attack prevention
- Rate limiting
- Slower login attampts (using bcrypt)

### XSS protection
- JWT stored in HTTPOnly cookies
- Sanitization of user input data
- Hidden HTTP headers (using helmet)

### Denial-of-Service (DOS) attack prevention
- Rate limiting
- Limited payload in request body

### NOSQL Query Injection prevention
- Sanitization of user input data
- Handling MongoDB using mongoose