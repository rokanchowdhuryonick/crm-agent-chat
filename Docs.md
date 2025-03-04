1. POST {{base_url}}/api/login/
    ```
    {
        "email": "customer1+rokanbd@cf",
        "password": "123456789"
    }
    ```

2. POST {{base_url}}/api/register/
    ```
    {
        "name": "Customer One",
        "email": "customer1+rokanbd@cf",
        "password": "123456789",
        "password_confirmation": "123456789"
    }
    ```

3. GET {{base_url}}/api/user
   Authorization: Bearer token


4. Start Chat Session
   POST {{base_url}}/api/chat/start
   Authorization: Bearer token
   ```
    {
        "customer_id": "3"
    }
    ```

5. Send Message
   POST {{base_url}}/api/chat/1/send
   Authorization: Bearer token
   ```
   {
        "chat_session_id": 1,
        "message": "Hi 1234",
        "type": "text"
    }
    ```