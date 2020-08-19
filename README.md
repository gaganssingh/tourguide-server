## Security features

### Database security
- Password encryption using bcrypt
- Password reset using node's built-in crypto linrary, using SHA256 hashing

### Brute force attack prevention
- Rate limiting (prevents an IP from making too many requests at the same time)
- Slower login attampts (using bcrypt)

### XSS protection
- JWT stored in HTTPOnly cookies
- Sanitization of user input data
- Hidden HTTP headers (using helmet)

### Denial-of-Service (DOS) attack prevention
- Rate limiting (prevents an IP from making too many requests at the same time)
- Limited payload in request body

### NOSQL Query Injection prevention
- Sanitization of user input data
- Handling MongoDB using mongoose