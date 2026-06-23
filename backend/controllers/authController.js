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

module.exports = { login };
