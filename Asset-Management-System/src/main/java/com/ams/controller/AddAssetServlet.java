package com.ams.controller;

import com.ams.dao.AssetDAO;
import com.ams.dao.AuditDAO;
import com.ams.model.Asset;
import com.ams.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;

@WebServlet("/add-asset")
public class AddAssetServlet extends HttpServlet {

    private AssetDAO assetDAO;
    private AuditDAO auditDAO;

    @Override
    public void init() {
        assetDAO = new AssetDAO();
        auditDAO = new AuditDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Forward to the add asset form
        request.getRequestDispatcher("add-asset.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect("index.jsp");
            return;
        }
        User currentUser = (User) session.getAttribute("user");

        try {
            Asset asset = new Asset();
            asset.setAssetIdTag(request.getParameter("assetIdTag"));
            asset.setAssetName(request.getParameter("assetName"));
            asset.setCategoryId(Long.parseLong(request.getParameter("categoryId")));
            asset.setSerialNo(request.getParameter("serialNo"));
            
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            asset.setPurchaseDate(sdf.parse(request.getParameter("purchaseDate")));
            
            String warrantyStr = request.getParameter("warrantyExpiry");
            if (warrantyStr != null && !warrantyStr.isEmpty()) {
                asset.setWarrantyExpiry(sdf.parse(warrantyStr));
            }
            
            // By default, new assets are 'Available' (status_id = 1)
            asset.setStatusId(1); 
            
            // Insert asset to DB
            long newAssetId = assetDAO.addAsset(asset);
            
            if(newAssetId > 0) {
                // Log Audit Trail
                auditDAO.logAction(currentUser.getId(), "CREATE", "ASSET", newAssetId, "Added new asset: " + asset.getAssetName());
                
                // Redirect back to dashboard with success parameter
                response.sendRedirect("dashboard?success=AssetAdded");
            } else {
                request.setAttribute("errorMessage", "Failed to add asset. ID or Serial might already exist.");
                request.getRequestDispatcher("add-asset.jsp").forward(request, response);
            }

        } catch (ParseException | NumberFormatException e) {
            e.printStackTrace();
            request.setAttribute("errorMessage", "Invalid form data format.");
            request.getRequestDispatcher("add-asset.jsp").forward(request, response);
        }
    }
}
