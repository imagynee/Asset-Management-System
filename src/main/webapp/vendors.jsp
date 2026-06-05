<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vendor Management - AMS</title>
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
                <a href="vendors" class="nav-item active"><i data-lucide="store"></i> Vendors</a>
                <a href="assign-asset" class="nav-item"><i data-lucide="user-check"></i> Asset Assignment</a>
            </nav>
        </aside>

        <main class="main-content">
            <header class="top-header">
                <div class="header-left"><h2>Vendor Management</h2></div>
            </header>

            <div class="content-body">
                <!-- Add Vendor Form -->
                <div class="card" style="margin-bottom: 24px;">
                    <h3 class="card-title">Add New Vendor (Supplier/Service Provider)</h3>
                    <form action="vendors" method="POST" style="display: flex; gap: 16px; align-items: flex-end;">
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Vendor Name</label>
                            <input type="text" name="vendorName" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;" required>
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Email</label>
                            <input type="email" name="contactEmail" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Phone</label>
                            <input type="text" name="contactPhone" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="height:42px;"><i data-lucide="plus"></i> Add</button>
                    </form>
                </div>

                <!-- Vendors List -->
                <div class="card">
                    <h3 class="card-title">Registered Vendors</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Vendor Name</th>
                                <th>Contact Email</th>
                                <th>Contact Phone</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="vendor" items="${vendors}">
                                <tr>
                                    <td>${vendor.id}</td>
                                    <td class="font-medium text-primary">${vendor.vendorName}</td>
                                    <td>${vendor.contactEmail}</td>
                                    <td>${vendor.contactPhone}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn btn-edit"><i data-lucide="edit"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty vendors}">
                                <tr><td colspan="5" style="text-align:center; padding: 20px;">No vendors found in the system.</td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>