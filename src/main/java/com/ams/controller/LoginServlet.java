package com.ams.controller;

import com.ams.dao.UserDAO;
import com.ams.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private UserDAO userDAO;

    @Override
    public void init() { 
        userDAO = new UserDAO(); 
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        
        User user = userDAO.authenticateUser(email, password);
        
        if (user != null) {
            // Authentication successful: create session
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            
            // Redirect to dashboard servlet to load data
            response.sendRedirect("dashboard");
        } else {
            // Authentication failed: route back to login with error
            request.setAttribute("errorMessage", "Invalid email or password. Please try again.");
            request.getRequestDispatcher("index.jsp").forward(request, response);
        }
    }
}
