// Initialize Lucide Icons
lucide.createIcons();

// QR Code Generator Function
function generateQR(assetId) {
    document.getElementById('qrModal').style.display = 'flex';
    document.getElementById('qrAssetTag').innerText = "Asset ID: " + assetId;
    
    // Clear previous QR code
    document.getElementById('qrcode').innerHTML = "";
    
    // Generate new QR code containing the Asset ID (this could be a URL in production)
    new QRCode(document.getElementById("qrcode"), {
        text: assetId,
        width: 200,
        height: 200,
        colorDark : "#0F172A",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

// Chart Configuration & Initialization
document.addEventListener('DOMContentLoaded', function() {
    
    // Global Chart.js defaults
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = '#64748B';
    
    // Common Donut Chart Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: '#1E293B',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        let value = context.raw;
                        let total = context.chart._metasets[context.datasetIndex].total;
                        let percentage = Math.round((value / total) * 100) + '%';
                        return label + value + ' (' + percentage + ')';
                    }
                }
            }
        }
    };

    // 1. Assets by Category Chart
    const ctxCategory = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: ['Laptops', 'Desktops', 'Printers', 'Monitors', 'Others'],
            datasets: [{
                data: [540, 320, 150, 120, 115],
                backgroundColor: [
                    '#3B82F6', // Blue
                    '#10B981', // Green
                    '#F59E0B', // Orange
                    '#8B5CF6', // Purple
                    '#EF4444'  // Red
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: commonOptions
    });

    // 2. Assets by Status Chart
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Assigned', 'Available', 'Maintenance'],
            datasets: [{
                data: [945, 210, 90],
                backgroundColor: [
                    '#10B981', // Green (Assigned)
                    '#F59E0B', // Orange (Available)
                    '#EF4444'  // Red (Maintenance)
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: commonOptions
    });
});