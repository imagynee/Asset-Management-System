<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Log Maintenance - AMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="layout-wrapper">
        <aside class="sidebar">
            <div class="sidebar-header"><i data-lucide="layers" class="logo-icon"></i><div class="logo-text"><span class="brand">AMS</span></div></div>
            <nav class="sidebar-nav">
                <a href="dashboard" class="nav-item"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                <a href="maintenance" class="nav-item active"><i data-lucide="wrench"></i> Maintenance</a>
            </nav>
        </aside>

        <main class="main-content">
            <header class="top-header">
                <div class="header-left"><h2>Log Asset Repair</h2></div>
            </header>

            <div class="content-body">
                <div class="card" style="max-width: 600px; margin:0 auto;">
                    <h3 class="card-title" style="color:var(--color-red); display:flex; align-items:center; gap:8px;">
                        <i data-lucide="alert-triangle"></i> Send Asset for Maintenance
                    </h3>
                    <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom: 24px;">This action will mark the asset status as "Under Repair" and log the service details with a vendor.</p>
                    
                    <form action="maintenance" method="POST">
                        <div style="margin-bottom:16px;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Asset DB ID</label>
                            <input type="number" name="assetId" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;" required>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Vendor DB ID (Service Center)</label>
                            <input type="number" name="vendorId" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;" required>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Service Date</label>
                            <input type="date" name="serviceDate" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;" required>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Estimated Cost (₹)</label>
                            <input type="number" step="0.01" name="cost" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;" required>
                        </div>
                        <div style="margin-bottom:24px;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Issue / Remarks</label>
                            <textarea name="remarks" rows="3" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-family:inherit;"></textarea>
                        </div>
                        <div style="display:flex; gap:16px; justify-content:flex-end;">
                            <button type="submit" class="btn btn-red" style="background:var(--color-red); color:white; padding:10px 20px; border-radius:6px; font-weight:600;">Submit for Repair</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>