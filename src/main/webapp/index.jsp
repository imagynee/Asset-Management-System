<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - AMS</title>
    
    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Custom Base CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
    
    <style>
        .login-wrapper {
            display: flex; 
            height: 100vh; 
            width: 100vw;
            align-items: center; 
            justify-content: center;
            background-color: var(--bg-light);
        }
        .login-card {
            background: var(--card-bg); 
            padding: 48px 40px; 
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md); 
            width: 100%; 
            max-width: 420px;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        .login-logo { 
            color: var(--primary-blue); 
            margin-bottom: 16px; 
            width: 56px; 
            height: 56px;
        }
        .login-title { 
            font-size: 1.5rem; 
            font-weight: 700; 
            color: var(--text-main); 
            margin-bottom: 8px; 
        }
        .login-subtitle { 
            font-size: 0.9rem; 
            color: var(--text-muted); 
            margin-bottom: 32px; 
        }
        .form-group { 
            text-align: left; 
            margin-bottom: 20px; 
        }
        .form-label { 
            display: block; 
            font-size: 0.85rem; 
            font-weight: 600; 
            color: var(--text-main); 
            margin-bottom: 8px; 
        }
        .form-input {
            width: 100%; 
            padding: 12px 16px; 
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md); 
            font-size: 0.95rem; 
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
            color: var(--text-main);
        }
        .form-input:focus { 
            outline: none; 
            border-color: var(--primary-blue); 
            box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
        }
        .btn-block { 
            width: 100%; 
            justify-content: center; 
            padding: 12px; 
            font-size: 1rem; 
            margin-top: 10px;
        }
        .error-message { 
            color: var(--color-red); 
            font-size: 0.85rem; 
            margin-bottom: 20px; 
            font-weight: 500; 
            padding: 12px; 
            background: var(--bg-red-light); 
            border-radius: var(--radius-md); 
            display: flex; 
            align-items: center; 
            gap: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="login-wrapper">
        <div class="login-card">
            <i data-lucide="layers" class="login-logo"></i>
            <h1 class="login-title">Welcome to AMS</h1>
            <p class="login-subtitle">Sign in to manage organizational assets</p>
            
            <% 
                String errorMessage = (String) request.getAttribute("errorMessage");
                if (errorMessage != null) { 
            %>
                <div class="error-message">
                    <i data-lucide="alert-circle" style="width:18px; height:18px; flex-shrink:0;"></i> 
                    <span><%= errorMessage %></span>
                </div>
            <% } %>

            <form action="login" method="POST">
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" name="email" class="form-input" placeholder="admin@ams.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" class="form-input" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Sign In</button>
            </form>
        </div>
    </div>
    
    <script>
        // Initialize lucide icons
        lucide.createIcons();
    </script>
</body>
</html>