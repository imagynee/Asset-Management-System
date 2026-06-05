<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assign Asset - AMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .form-container { max-width: 600px; margin: 0 auto; background: var(--card-bg); padding: 32px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); }
        .form-group { display: flex; flex-direction: column; margin-bottom: 20px; }
        .form-label { font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; }
        .form-input, .form-select { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; }
        .btn-toolbar { display: flex; gap: 16px; justify-content: flex-end; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="layout-wrapper">
        <aside class="sidebar">
            <div class="sidebar-header"><i data-lucide="layers" class="logo-icon"></i><div class="logo-text"><span class="brand">AMS</span></div></div>
            <nav class="sidebar-nav">
                <a href="dashboard" class="nav-item"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                <a href="assign-asset" class="nav-item active"><i data-lucide="user-check"></i> Asset Assignment</a>
            </nav>
        </aside>

        <main class="main-content">
            <div class="content-body">
                <div class="form-container">
                    <h1 style="margin-bottom: 24px;">Assign Asset to Employee</h1>
                    <form action="assign-asset" method="POST">
                        <div class="form-group">
                            <label class="form-label">Select Asset</label>
                            <!-- In MVP, we use manual IDs. In prod, this is populated dynamically from AssetDAO -->
                            <input type="number" name="assetId" class="form-input" placeholder="Enter Asset DB ID (e.g., 1)" required>
                            <input type="hidden" name="assetName" value="Company Device"> 
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Employee</label>
                            <input type="number" name="userId" class="form-input" placeholder="Enter Employee DB ID (e.g., 2)" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Employee Email (For Notification)</label>
                            <input type="email" name="userEmail" class="form-input" placeholder="employee@company.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Remarks / Condition</label>
                            <input type="text" name="remarks" class="form-input" placeholder="e.g., Scratch on top cover">
                        </div>
                        <div class="btn-toolbar">
                            <a href="dashboard" class="btn btn-outline" style="border:1px solid #ccc; padding:8px 16px;">Cancel</a>
                            <button type="submit" class="btn btn-primary">Assign Asset</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>