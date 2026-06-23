const Category = require('../models/Category');
const Asset = require('../models/Asset');

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

const updateCategory = async (req, res) => {
    try {
        const payload = buildCategoryPayload(req.body);

        if (payload.categoryName) {
            payload.categoryName = payload.categoryName.trim();
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            payload,
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const assetCount = await Asset.countDocuments({ category: req.params.id });

        if (assetCount > 0) {
            return res.status(409).json({
                success: false,
                message: 'Category is assigned to one or more assets and cannot be deleted'
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
