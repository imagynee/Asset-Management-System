const Category = require('../models/Category');

const buildCategoryPayload = (body) => {
    const allowedFields = [
        'categoryName',
        'description'
    ];

    const payload = {};

    allowedFields.forEach((field) => {
        if (body[field] !== undefined && body[field] !== '') {
            payload[field] = body[field];
        }
    });

    return payload;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createCategory = async (req, res) => {
    try {
        const payload = buildCategoryPayload(req.body);

        if (!payload.categoryName) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const categoryName = payload.categoryName.trim();
        const existingCategory = await Category.findOne({
            categoryName: {
                $regex: `^${escapeRegex(categoryName)}$`,
                $options: 'i'
            }
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: 'Category already exists',
                category: existingCategory
            });
        }

        const category = await Category.create({
            ...payload,
            categoryName
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ categoryName: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategories
};
