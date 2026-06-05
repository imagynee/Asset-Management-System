package com.ams.controller;

import com.ams.dao.MaintenanceDAO;
import com.ams.dao.AuditDAO;
import com.ams.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/maintenance")
public class MaintenanceServlet extends HttpServlet {

    private MaintenanceDAO maintenanceDAO;
    private AuditDAO auditDAO;

    @Override
    public void init() {
        maintenanceDAO = new MaintenanceDAO();
        auditDAO = new AuditDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.getRequestDispatcher("maintenance.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect("index.jsp");
            return;
        }
        User admin = (User) session.getAttribute("user");

        try {
            long assetId = Long.parseLong(request.getParameter("assetId"));
            long vendorId = Long.parseLong(request.getParameter("vendorId"));
            String serviceDate = request.getParameter("serviceDate"); // yyyy-mm-dd
            double cost = Double.parseDouble(request.getParameter("cost"));
            String remarks = request.getParameter("remarks");

            if (maintenanceDAO.logMaintenance(assetId, vendorId, serviceDate, cost, remarks)) {
                auditDAO.logAction(admin.getId(), "MAINTENANCE", "ASSET", assetId, "Sent for repair. Vendor ID: " + vendorId);
                response.sendRedirect("dashboard?success=AssetInMaintenance");
            } else {
                response.sendRedirect("maintenance.jsp?error=Failed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("maintenance.jsp?error=InvalidInput");
        }
    }
}
