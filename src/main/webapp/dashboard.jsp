<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMS - Asset Management System</title>
    
    <!-- Google Fonts: Plus Jakarta Sans for a modern, clean look -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons for clean SVG icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Chart.js for data visualization -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="layout-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <i data-lucide="layers" class="logo-icon"></i>
                <div class="logo-text">
                    <span class="brand">AMS</span>
                    <span class="sub-brand">ASSET<br>MANAGEMENT<br>SYSTEM</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard" class="nav-item active"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                <a href="#" class="nav-item"><i data-lucide="monitor-smartphone"></i> Assets</a>
                <a href="#" class="nav-item"><i data-lucide="folders"></i> Categories</a>
                <a href="#" class="nav-item"><i data-lucide="users"></i> Employees</a>
                <a href="vendors" class="nav-item"><i data-lucide="store"></i> Vendors</a>
                <a href="assign-asset" class="nav-item"><i data-lucide="user-check"></i> Asset Assignment</a>
                <a href="#" class="nav-item"><i data-lucide="corner-down-left"></i> Return Assets</a>
                <a href="maintenance" class="nav-item"><i data-lucide="wrench"></i> Maintenance</a>
                <a href="#" class="nav-item"><i data-lucide="qr-code"></i> QR Code Scanner</a>
                <a href="generate-report" class="nav-item"><i data-lucide="file-bar-chart"></i> Reports</a>
                <a href="#" class="nav-item"><i data-lucide="bell"></i> Notifications</a>
                <a href="#" class="nav-item"><i data-lucide="settings"></i> Settings</a>
                <a href="#" class="nav-item"><i data-lucide="users-cog"></i> Users</a>
            </nav>

            <div class="sidebar-footer">
                <a href="#" class="nav-item"><i data-lucide="log-out"></i> Logout</a>
                <div class="help-box">
                    <i data-lucide="info" class="help-icon"></i>
                    <div>
                        <span class="help-title">Need Help?</span>
                        <span class="help-sub">Contact Administrator</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Top Header -->
            <header class="top-header">
                <div class="header-left">
                    <button class="menu-toggle"><i data-lucide="menu"></i></button>
                    <div class="search-bar">
                        <i data-lucide="search"></i>
                        <input type="text" placeholder="Search assets, users, categories...">
                    </div>
                </div>
                <div class="header-right">
                    <div class="icon-btn position-relative">
                        <i data-lucide="bell"></i>
                        <span class="badge">5</span>
                    </div>
                    <div class="icon-btn">
                        <i data-lucide="scan-line"></i>
                    </div>
                    <div class="user-profile">
                        <div class="avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="user-info">
                            <span class="user-name">Admin User</span>
                            <span class="user-role">Administrator</span>
                        </div>
                        <i data-lucide="chevron-down" class="dropdown-icon"></i>
                    </div>
                </div>
            </header>

            <!-- Dashboard Content -->
            <div class="content-body">
                <div class="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p class="subtitle">Welcome back, ${currentUser != null ? currentUser.name : 'Admin User'}!</p>
                    </div>
                    <div class="header-actions">
                        <a href="add-asset" class="btn btn-primary"><i data-lucide="plus"></i> Add Asset</a>
                        <button onclick="generateQR('SYSTEM-SCAN')" class="btn btn-success"><i data-lucide="qr-code"></i> Scan QR Code</button>
                        <button class="btn btn-purple"><i data-lucide="file-text"></i> Generate Report</button>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon-wrap icon-blue">
                            <i data-lucide="monitor"></i>
                        </div>
                        <div class="kpi-details">
                            <span class="kpi-label">Total Assets</span>
                            <span class="kpi-value">1,245</span>
                            <a href="#" class="kpi-link">View all assets &rarr;</a>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon-wrap icon-green">
                            <i data-lucide="check-square"></i>
                        </div>
                        <div class="kpi-details">
                            <span class="kpi-label">Assigned Assets</span>
                            <span class="kpi-value">945</span>
                            <span class="kpi-subtext text-green">75.90% of total</span>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon-wrap icon-orange">
                            <i data-lucide="package"></i>
                        </div>
                        <div class="kpi-details">
                            <span class="kpi-label">Available Assets</span>
                            <span class="kpi-value">210</span>
                            <span class="kpi-subtext text-orange">16.87% of total</span>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon-wrap icon-red">
                            <i data-lucide="wrench"></i>
                        </div>
                        <div class="kpi-details">
                            <span class="kpi-label">Under Maintenance</span>
                            <span class="kpi-value">90</span>
                            <span class="kpi-subtext text-red">7.23% of total</span>
                        </div>
                    </div>
                </div>

                <!-- Charts & Activity Grid -->
                <div class="charts-grid">
                    <div class="card">
                        <h3 class="card-title">Assets by Category</h3>
                        <div class="chart-container">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header-flex">
                            <h3 class="card-title">Recent Activity</h3>
                            <a href="#" class="kpi-link">View all activity &rarr;</a>
                        </div>
                        <ul class="activity-list">
                            <li>
                                <div class="activity-icon icon-blue"><i data-lucide="laptop"></i></div>
                                <div class="activity-text">
                                    <p><strong>Dell Laptop (A1001)</strong> assigned to John Doe</p>
                                    <span>2 minutes ago</span>
                                </div>
                            </li>
                            <li>
                                <div class="activity-icon icon-green"><i data-lucide="printer"></i></div>
                                <div class="activity-text">
                                    <p><strong>HP Printer (P2002)</strong> added to inventory</p>
                                    <span>15 minutes ago</span>
                                </div>
                            </li>
                            <li>
                                <div class="activity-icon icon-teal"><i data-lucide="corner-down-left"></i></div>
                                <div class="activity-text">
                                    <p><strong>Apple MacBook (A1003)</strong> returned by Mary Smith</p>
                                    <span>1 hour ago</span>
                                </div>
                            </li>
                            <li>
                                <div class="activity-icon icon-red"><i data-lucide="wrench"></i></div>
                                <div class="activity-text">
                                    <p><strong>Logitech Mouse (A1004)</strong> under maintenance</p>
                                    <span>2 hours ago</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Assets by Status</h3>
                        <div class="chart-container">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent Assets Table -->
                <div class="card mt-4">
                    <div class="card-header-flex">
                        <h3 class="card-title">Recent Assets</h3>
                        <a href="#" class="kpi-link">View all assets &rarr;</a>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Asset ID</th>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Serial Number</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-primary font-medium">A1001</td>
                                    <td>Dell Latitude 5440</td>
                                    <td>Laptop</td>
                                    <td>DL5440X123456</td>
                                    <td><span class="badge-status badge-success">Assigned</span></td>
                                    <td>John Doe</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn btn-edit"><i data-lucide="edit-2"></i></button>
                                            <button onclick="generateQR('A100X')" class="action-btn btn-qr"><i data-lucide="qr-code"></i></button>
                                            <button class="action-btn btn-delete"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-primary font-medium">P2002</td>
                                    <td>HP LaserJet Pro</td>
                                    <td>Printer</td>
                                    <td>HPLJ123789</td>
                                    <td><span class="badge-status badge-warning">Available</span></td>
                                    <td>-</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn btn-edit"><i data-lucide="edit-2"></i></button>
                                            <button onclick="generateQR('A100X')" class="action-btn btn-qr"><i data-lucide="qr-code"></i></button>
                                            <button class="action-btn btn-delete"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-primary font-medium">A1003</td>
                                    <td>Apple MacBook Air</td>
                                    <td>Laptop</td>
                                    <td>MBA2023X456</td>
                                    <td><span class="badge-status badge-success">Assigned</span></td>
                                    <td>Mary Smith</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn btn-edit"><i data-lucide="edit-2"></i></button>
                                            <button onclick="generateQR('A100X')" class="action-btn btn-qr"><i data-lucide="qr-code"></i></button>
                                            <button class="action-btn btn-delete"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-primary font-medium">M3001</td>
                                    <td>Samsung 24" Monitor</td>
                                    <td>Monitor</td>
                                    <td>SM24F450X789</td>
                                    <td><span class="badge-status badge-danger">Maintenance</span></td>
                                    <td>-</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn btn-edit"><i data-lucide="edit-2"></i></button>
                                            <button onclick="generateQR('A100X')" class="action-btn btn-qr"><i data-lucide="qr-code"></i></button>
                                            <button class="action-btn btn-delete"><i data-lucide="trash-2"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- Initialize Icons and Charts -->
    <script src="assets/js/dashboard.js"></script>
</body>
</html>nitialize Icons and Charts -->
    <script src="assets/js/dashboard.js"></script>
</body>
</html>(--card-bg); padding:32px; border-radius:var(--radius-lg); text-align:center; max-width: 400px; width:100%;">
            <h3 style="margin-bottom: 8px;">Asset QR Code</h3>
            <p id="qrAssetTag" style="color:var(--text-muted); margin-bottom: 24px; font-size:0.9rem;"></p>
            <div id="qrcode" style="display:flex; justify-content:center; margin-bottom:24px;"></div>
            <button onclick="document.getElementById('qrModal').style.display='none'" class="btn btn-outline" style="width:100%; justify-content:center;">Close</button>
        </div>
    </div>

    <!-- Initialize Icons and Charts -->
    <script src="assets/js/dashboard.js"></script>
</body>
</html>