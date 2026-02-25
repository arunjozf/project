# Django Backend Setup Guide

## Project Structure
```
backend/
├── config/
│   ├── __init__.py
│   ├── settings.py      (Database config, installed apps)
│   ├── urls.py          (Main routing)
│   ├── asgi.py
│   └── wsgi.py
├── users/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py         (Django admin configuration)
│   ├── apps.py
│   ├── models.py        (User model)
│   ├── serializers.py   (API serializers)
│   ├── urls.py          (User endpoints)
│   ├── views.py         (Signup, Login, Logout logic)
│   └── tests.py
├── manage.py            (Django management command)
├── requirements.txt     (Python dependencies)
├── .env                 (Environment variables)
└── .gitignore
```

## Step 1: Create MySQL Database

Open MySQL Workbench or Command Prompt and create the database:

```sql
CREATE DATABASE taxi_app;
```

## Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 3: Configure .env File

Edit the `.env` file with your MySQL credentials:

```
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DB_ENGINE=mysql
DB_NAME=taxi_app
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Step 4: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Step 5: Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

## Step 6: Run the Server

```bash
python manage.py runserver
```

The server will run at `http://127.0.0.1:8000/`

## API Endpoints

### 1. User Signup
**POST** `/api/users/signup/`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account created successfully!",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "token": "your-auth-token-here"
  }
}
```

### 2. User Login
**POST** `/api/users/login/`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful!",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "token": "your-auth-token-here"
  }
}
```

### 3. Get Current User
**GET** `/api/users/me/`

**Headers:**
```
Authorization: Token your-auth-token-here
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone_number": null,
    "profile_picture": null
  }
}
```

### 4. User Logout
**POST** `/api/users/logout/`

**Headers:**
```
Authorization: Token your-auth-token-here
```

## Connecting Frontend to Backend

In your React signup component, update the API call:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:8000/api/users/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Store token in localStorage
      localStorage.setItem('authToken', result.data.token);
      // Redirect to login/dashboard
    } else {
      setError(result.message);
    }
  } catch (error) {
    setError('Network error: ' + error.message);
  }
};
```

## Admin Panel

Access at: `http://localhost:8000/admin/`
Use your superuser credentials to manage users.

## Troubleshooting

### MySQL Connection Error
- Make sure MySQL is running
- Check DB_USER and DB_PASSWORD in .env
- Verify database exists: `SHOW DATABASES;`

### Port 8000 Already in Use
```bash
python manage.py runserver 8001
```

### Migration Errors
```bash
python manage.py migrate --run-syncdb
```
