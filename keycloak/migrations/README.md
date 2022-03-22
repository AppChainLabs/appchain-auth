# Migration from Auth0 to Keycloak

## Preparation

1. Prepare exported `users.json`file that included bcrypt-hashed `passwordHash`
2. Prepare `credential.json` file that makes destructuring line below valid
    ```js
    const {
        AUTH_URL,
        AUTH_REALM_NAME,
        AUTH_ADMIN_CLIENT,
        AUTH_ADMIN_SECRET,
    } = credential;
    ```
   
## Run the script
```bash
npx ts-node migrate
```

## Result

Check `Error.txt` for error record(s).

Check `Successful.txt` for successful record(s).