const getAssetCountsByField = async (Asset, fieldName) => {
    const counts = await Asset.aggregate([
        {
            $group: {
                _id: `$${fieldName}`,
                assetCount: { $sum: 1 }
            }
        }
    ]);

    return new Map(
        counts
            .filter((item) => item._id)
            .map((item) => [item._id.toString(), item.assetCount])
    );
};

const attachAssetCounts = (items, countMap) => (
    items.map((item) => {
        const plainItem = item.toObject();

        return {
            ...plainItem,
            assetCount: countMap.get(plainItem._id.toString()) || 0
        };
    })
);

module.exports = {
    getAssetCountsByField,
    attachAssetCounts
};
