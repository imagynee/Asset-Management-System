<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add New Asset - AMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .form-container { max-width: 800px; margin: 0 auto; background: var(--card-bg); padding: 32px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; }
        .form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
        .form-input, .form-select { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; font-size: 0.95rem; color: var(--text-main); background-color: var(--card-bg); transition: all 0.2s; }
        .form-input:focus, .form-select:focus { outline: none; border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1); }
        .btn-toolbar { display: flex; gap: 16px; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 24px; }
        .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); padding: 8px 16px; border-radius: var(--radius-md); font-weight: 500; }
        .btn-outline:hover { background: var(--bg-light); }
        .alert-error { background-color: var(--bg-red-light); color: var(--color-red); padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 24px; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 8px; }
    </style>
</head>
<body>
    <div class="layout-wrapper">
        <!-- Sidebar exactly like dashboard -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <i data-lucide="layers" class="logo-icon"></i>
                <div class="logo-text"><span class="brand">AMS</span><span class="sub-brand">ASSET MANAGEMENT</span></div>
            </div>
            <nav class="sidebar-nav">
                <a href="dashboard" class="nav-item"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                <a href="add-asset" class="nav-item active"><i data-lucide="plus-circle"></i> Add Asset</a>
                <a href="dashboard" class="nav-item"><i data-lucide="corner-down-left"></i> Return / Dashboard</a>
            </nav>
        </aside>

        <main class="main-content">
            <header class="top-header">
                <div class="header-left"><h2 style="font-size: 1.25rem;">Asset Registration</h2></div>
            </header>

            <div class="content-body">
                <div class="form-container">
                    <div style="margin-bottom: 24px;">
                        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Register New Asset</h1>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Fill in the details below to add a new asset to the organizational inventory.</p>
                    </div>

                    <% String error = (String) request.getAttribute("errorMessage"); if(error != null) { %>
                        <div class="alert-error"><i data-lucide="alert-circle" style="width:16px;"></i> <%= error %></div>
                    <% } %>

                    <form action="add-asset" method="POST">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Asset ID Tag (e.g. A1050)</label>
                                <input type="text" name="assetIdTag" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Asset Name</label>
                                <input type="text" name="assetName" class="form-input" placeholder="e.g. Dell XPS 15" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select name="categoryId" class="form-select" required>
                                    <!-- In real app, load this from CategoryDAO, hardcoded here for MVP -->
                                    <option value="1">Laptops</option>
                                    <option value="2">Desktops</option>
                                    <option value="3">Printers</option>
                                    <option value="4">Networking Routers</option>
                                    <option value="5">Software Licenses</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Serial Number</label>
                                <input type="text" name="serialNo" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Purchase Date</label>
                                <input type="date" name="purchaseDate" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Warranty Expiry Date</label>
                                <input type="date" name="warrantyExpiry" class="form-input">
                            </div>
                        </div>
                        <div class="btn-toolbar">
                            <a href="dashboard" class="btn-outline">Cancel</a>
                            <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Save Asset</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>