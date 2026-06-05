package com.ams.controller;

import com.ams.dao.AssetDAO;
import com.ams.model.Asset;
import com.ams.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

@WebServlet("/dashboard")
public class DashboardServlet extends HttpServlet {
    
    private AssetDAO assetDAO;

    @Override
    public void init() {
        assetDAO = new AssetDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        
        // Ensure user is logged in
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect("index.jsp");
            return;
        }

        User user = (User) session.getAttribute("user");
        request.setAttribute("currentUser", user);

        // Fetch dynamic asset data from the database
        List<Asset> recentAssets = assetDAO.getAllRecentAssets();
        request.setAttribute("recentAssets", recentAssets);

        // Forward to the JSP view
        request.getRequestDispatcher("dashboard.jsp").forward(request, response);
    }
}
