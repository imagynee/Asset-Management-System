const crypto = require('crypto');

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const allCharacters = `${letters}${numbers}`;

const getRandomCharacter = (characters) => {
    return characters[crypto.randomInt(0, characters.length)];
};

const shuffle = (characters) => {
    const result = characters.split('');

    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = crypto.randomInt(0, index + 1);
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result.join('');
};

const generateTemporaryPassword = (length = 10) => {
    if (length < 2) {
        throw new Error('Temporary password length must be at least 2 characters');
    }

    // Force at least one letter and one number, then fill the rest securely.
    let password = getRandomCharacter(letters) + getRandomCharacter(numbers);

    while (password.length < length) {
        password += getRandomCharacter(allCharacters);
    }

    return shuffle(password);
};

module.exports = generateTemporaryPassword;
