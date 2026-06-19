const escapeRegex = (value = '') => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getSearchFilter = (search, fields) => {
    if (typeof search !== 'string' || !search.trim()) {
        return {};
    }

    const regex = new RegExp(escapeRegex(search.trim()), 'i');

    return {
        $or: fields.map((field) => ({
            [field]: regex
        }))
    };
};

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const getPagination = (query) => {
    const hasPagination = query.page !== undefined || query.limit !== undefined;
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);

    return {
        hasPagination,
        page,
        limit,
        skip: (page - 1) * limit
    };
};

const getSort = (query, allowedFields, defaultSort = { createdAt: -1 }) => {
    if (!query.sortBy || !allowedFields.includes(query.sortBy)) {
        return defaultSort;
    }

    const sortOrder = String(query.sortOrder || query.order || 'asc').toLowerCase();

    return {
        [query.sortBy]: sortOrder === 'desc' || sortOrder === '-1' ? -1 : 1
    };
};

module.exports = {
    getSearchFilter,
    getPagination,
    getSort,
    toArray
};
