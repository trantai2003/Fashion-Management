
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
};


export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
};


export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
};


export const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number || 0);
};
