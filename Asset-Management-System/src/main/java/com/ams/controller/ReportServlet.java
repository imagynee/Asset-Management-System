package com.ams.controller;

import com.ams.dao.AssetDAO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Handles generating Reports (PDF Requirement)
 * Generates a CSV file of assets for download.
 */
@WebServlet("/generate-report")
public class ReportServlet extends HttpServlet {

    private AssetDAO assetDAO;

    @Override
    public void init() {
        assetDAO = new AssetDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"asset_report.csv\"");

        StringBuilder csv = new StringBuilder();
        csv.append("Asset ID,Asset Name,Category,Serial Number,Status,Assigned To\n");

        // Fetch assets and write to CSV
        assetDAO.getAllRecentAssets().forEach(asset -> {
            csv.append(asset.getAssetIdTag()).append(",")
               .append(asset.getAssetName().replace(",", " ")).append(",")
               .append(asset.getCategoryName()).append(",")
               .append(asset.getSerialNo()).append(",")
               .append(asset.getStatusName()).append(",")
               .append(asset.getAssignedTo()).append("\n");
        });

        response.getWriter().write(csv.toString());
    }
}
