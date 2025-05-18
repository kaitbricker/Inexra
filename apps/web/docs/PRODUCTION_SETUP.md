# Production Setup Guide

## Environment Variables

Create a `.env.production` file in the root of your web app with the following variables:

### Security
- `NEXTAUTH_URL`: Your production domain URL (e.g., https://your-app.com)
- `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
- `JWT_SECRET`: A secure random string for JWT access tokens
- `JWT_REFRESH_SECRET`: A secure random string for JWT refresh tokens
- `SESSION_SECRET`: A secure random string for session encryption

### Database
- `DATABASE_URL`: Your production database connection string

### Redis
- `REDIS_URL`: Your production Redis connection string

### API Keys
- `SENDGRID_API_KEY`: Your SendGrid API key for email
- `OPENAI_API_KEY`: Your OpenAI API key

### Monitoring
- `SENTRY_DSN`: Your Sentry DSN for error tracking
- `LOGROCKET_ID`: Your LogRocket ID for session replay

### Rate Limiting
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)
- `RATE_LIMIT_WINDOW`: Time window in seconds (default: 900)

### CORS
- `CORS_ORIGIN`: Your production domain URL

### MFA
- `MFA_ISSUER`: Your application name for MFA

### Cache
- `CACHE_TTL`: Cache time-to-live in seconds (default: 3600)
- `ENABLE_COMPRESSION`: Enable response compression (true/false)

### Metrics
- `ENABLE_METRICS`: Enable metrics collection (true/false)
- `METRICS_PORT`: Port for metrics server (default: 9090)

### Logging
- `LOG_LEVEL`: Logging level (info/warn/error)
- `ENABLE_REQUEST_LOGGING`: Enable request logging (true/false)

## Security Best Practices

1. **Generate Secure Secrets**
   ```bash
   # Generate secure random strings for secrets
   openssl rand -base64 32
   ```

2. **Enable HTTPS**
   - Configure SSL/TLS certificates
   - Enable HSTS
   - Redirect HTTP to HTTPS

3. **Database Security**
   - Use strong passwords
   - Enable SSL/TLS
   - Restrict database access to application servers
   - Regular backups

4. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - CSRF protection
   - XSS prevention

5. **Authentication**
   - Enable MFA
   - Implement password policies
   - Use secure session management
   - Regular token rotation

6. **Monitoring**
   - Set up error tracking
   - Configure alerts
   - Monitor performance metrics
   - Log security events

## Deployment Checklist

1. **Pre-deployment**
   - [ ] Run security audit
   - [ ] Test all features
   - [ ] Check environment variables
   - [ ] Verify database migrations
   - [ ] Test backup procedures

2. **Deployment**
   - [ ] Deploy to staging first
   - [ ] Run smoke tests
   - [ ] Deploy to production
   - [ ] Verify SSL/TLS
   - [ ] Check monitoring setup

3. **Post-deployment**
   - [ ] Monitor error rates
   - [ ] Check performance metrics
   - [ ] Verify backups
   - [ ] Test security features
   - [ ] Document deployment

## Security Tools

1. **Static Analysis**
   - ESLint with security plugins
   - SonarQube
   - Snyk

2. **Dynamic Analysis**
   - OWASP ZAP
   - Burp Suite
   - Nmap

3. **Monitoring**
   - Sentry for error tracking
   - LogRocket for session replay
   - Prometheus for metrics
   - Grafana for visualization

## Regular Maintenance

1. **Weekly**
   - Review error logs
   - Check security alerts
   - Monitor performance
   - Update dependencies

2. **Monthly**
   - Security audit
   - Backup verification
   - Performance optimization
   - Documentation updates

3. **Quarterly**
   - Penetration testing
   - Security training
   - Disaster recovery testing
   - Compliance review 