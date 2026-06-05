# Use the official Apache Tomcat 9 image with JDK 11
FROM tomcat:9.0-jdk11-openjdk-slim

# Remove the default Tomcat applications to clean up
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the built WAR file from the target directory into the Tomcat webapps directory
# Tomcat will automatically extract and run it as the ROOT (default) application
COPY target/ams.war /usr/local/tomcat/webapps/ROOT.war

# Expose port 8080 (Render and Koyeb will route traffic to this port)
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
