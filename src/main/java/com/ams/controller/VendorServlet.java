package com.ams.controller;

import com.ams.dao.VendorDAO;
import com.ams.model.Vendor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/vendors")
public class VendorServlet extends HttpServlet {
    private VendorDAO vendorDAO;

    @Override
    public void init() {
        vendorDAO = new VendorDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (request.getSession(false) == null || request.getSession().getAttribute("user") == null) {
            response.sendRedirect("index.jsp");
            return;
        }
        List<Vendor> vendorList = vendorDAO.getAllVendors();
        request.setAttribute("vendors", vendorList);
        request.getRequestDispatcher("vendors.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String name = request.getParameter("vendorName");
        String email = request.getParameter("contactEmail");
        String phone = request.getParameter("contactPhone");

        Vendor vendor = new Vendor();
        vendor.setVendorName(name);
        vendor.setContactEmail(email);
        vendor.setContactPhone(phone);

        if (vendorDAO.addVendor(vendor)) {
            response.sendRedirect("vendors?success=VendorAdded");
        } else {
            response.sendRedirect("vendors?error=FailedToAdd");
        }
    }
}
