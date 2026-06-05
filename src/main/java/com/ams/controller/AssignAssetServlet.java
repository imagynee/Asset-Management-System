package com.ams.controller;

import com.ams.dao.AssignmentDAO;
import com.ams.dao.AuditDAO;
import com.ams.model.User;
import com.ams.util.EmailUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/assign-asset")
public class AssignAssetServlet extends HttpServlet {

    private AssignmentDAO assignmentDAO;
    private AuditDAO auditDAO;

    @Override
    public void init() {
        assignmentDAO = new AssignmentDAO();
        auditDAO = new AuditDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.getRequestDispatcher("assign-asset.jsp").forward(request, response);
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
            long userId = Long.parseLong(request.getParameter("userId"));
            String userEmail = request.getParameter("userEmail"); // Sent from form for notification
            String assetName = request.getParameter("assetName"); 
            String remarks = request.getParameter("remarks");

            boolean success = assignmentDAO.assignAsset(assetId, userId, admin.getId(), remarks);

            if (success) {
                auditDAO.logAction(admin.getId(), "ASSIGN", "ASSET", assetId, "Assigned to user ID: " + userId);
                
                // Trigger Email Notification (PDF Requirement)
                if(userEmail != null && !userEmail.isEmpty()) {
                    String subject = "New Asset Assigned: " + assetName;
                    String body = "Hello,\n\nA new asset (" + assetName + ") has been assigned to you by the administrator.\nRemarks: " + remarks + "\n\nPlease ensure proper care of organizational assets.\n\nRegards,\nAMS System";
                    // Note: This runs synchronously. In production, run in a separate thread.
                    EmailUtil.sendEmail(userEmail, subject, body);
                }

                response.sendRedirect("dashboard?success=AssetAssigned");
            } else {
                request.setAttribute("errorMessage", "Failed to assign asset. It may already be assigned.");
                request.getRequestDispatcher("assign-asset.jsp").forward(request, response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            request.setAttribute("errorMessage", "Invalid input data.");
            request.getRequestDispatcher("assign-asset.jsp").forward(request, response);
        }
    }
}
