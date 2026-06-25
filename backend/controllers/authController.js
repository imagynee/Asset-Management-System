const fs = require('fs');
const path = require('path');

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
        return res.status(500).json({ message: 'Admin credentials are not configured on the server' });
    }

    if (username === adminUsername && password === adminPassword) {
        return res.status(200).json({ success: true, message: 'Login successful' });
    }

    return res.status(401).json({ message: 'Invalid username or password' });
};

const updateEnvPassword = (newPassword) => {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found');
    }
    let envContent = fs.readFileSync(envPath, 'utf8');
    const regex = /^ADMIN_PASSWORD=.*$/m;
    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `ADMIN_PASSWORD=${newPassword}`);
    } else {
        envContent += `\nADMIN_PASSWORD=${newPassword}`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
};

const changePassword = (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (currentPassword !== adminPassword) {
        return res.status(400).json({ message: 'Incorrect current password' });
    }

    try {
        updateEnvPassword(newPassword);
        process.env.ADMIN_PASSWORD = newPassword;
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Failed to update password in env:', error);
        return res.status(500).json({ message: 'Failed to update password on server' });
    }
};

module.exports = { login, changePassword };

