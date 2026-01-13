import PDFDocument from 'pdfkit';
import { RegistroTurno, Sucursal } from '../models/index.js';
import { Op } from 'sequelize';

// Helper function to format currency
function formatCurrency(value) {
  return `Q ${parseFloat(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper function to format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-GT');
}

// Generate PDF for Resumen por Sucursal
export async function generateResumenSucursalPDF(fecha_inicio, fecha_fin, sucursal_id) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'letter',
        layout: 'landscape'
      });
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('Resumen por Sucursal', { align: 'center' });
      doc.moveDown(0.5);
      
      // Date range
      let periodText = 'Período: ';
      if (fecha_inicio && fecha_fin) {
        periodText += `${formatDate(fecha_inicio)} - ${formatDate(fecha_fin)}`;
      } else if (fecha_inicio) {
        periodText += `Desde ${formatDate(fecha_inicio)}`;
      } else if (fecha_fin) {
        periodText += `Hasta ${formatDate(fecha_fin)}`;
      } else {
        periodText += 'Todos los registros';
      }
      doc.fontSize(10).font('Helvetica').text(periodText, { align: 'center' });
      doc.moveDown(1);
      
      // Get data
      const where = {};
      if (fecha_inicio && fecha_fin) {
        where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
      } else if (fecha_inicio) {
        where.fecha = { [Op.gte]: fecha_inicio };
      } else if (fecha_fin) {
        where.fecha = { [Op.lte]: fecha_fin };
      }
      
      if (sucursal_id) {
        where.sucursal_id = sucursal_id;
      }
      
      const registros = await RegistroTurno.findAll({
        where,
        include: [
          { model: Sucursal, as: 'sucursal' }
        ]
      });
      
      // Group by sucursal
      const resumen = {};
      
      for (const registro of registros) {
        const sucursalId = registro.sucursal_id;
        const sucursalNombre = registro.sucursal?.nombre || 'Sin sucursal';
        
        if (!resumen[sucursalId]) {
          resumen[sucursalId] = {
            sucursal_id: sucursalId,
            sucursal_nombre: sucursalNombre,
            total_depositado: 0,
            total_tarjeta: 0,
            total_sistema: 0,
            total_facturado: 0
          };
        }
        
        resumen[sucursalId].total_depositado += parseFloat(registro.monto_depositado || 0);
        resumen[sucursalId].total_tarjeta += parseFloat(registro.venta_tarjeta || 0);
        resumen[sucursalId].total_sistema += parseFloat(registro.total_sistema || 0);
        resumen[sucursalId].total_facturado += parseFloat(registro.total_facturado || 0);
      }
      
      const data = Object.values(resumen);
      
      // Calculate totals
      const totales = {
        total_depositado: 0,
        total_tarjeta: 0,
        total_sistema: 0,
        total_facturado: 0
      };
      
      data.forEach(item => {
        totales.total_depositado += item.total_depositado;
        totales.total_tarjeta += item.total_tarjeta;
        totales.total_sistema += item.total_sistema;
        totales.total_facturado += item.total_facturado;
      });
      
      // Draw table
      const startX = 50;
      const startY = doc.y;
      const colWidths = [120, 100, 100, 100, 100];
      const rowHeight = 25;
      
      // Headers
      doc.font('Helvetica-Bold').fontSize(9);
      let x = startX;
      const headers = ['Sucursal', 'Total Depositado', 'Total Tarjeta', 'Total Sistema', 'Total Facturado'];
      
      headers.forEach((header, i) => {
        doc.rect(x, startY, colWidths[i], rowHeight).stroke();
        doc.fillColor('#000000').text(header, x + 5, startY + 8, {
          width: colWidths[i] - 10,
          align: i === 0 ? 'left' : 'right'
        });
        x += colWidths[i];
      });
      
      // Data rows
      doc.font('Helvetica').fontSize(8);
      let y = startY + rowHeight;
      
      data.forEach(item => {
        x = startX;
        
        // Draw cells
        doc.rect(x, y, colWidths[0], rowHeight).stroke();
        doc.fillColor('#000000').text(item.sucursal_nombre, x + 5, y + 8, {
          width: colWidths[0] - 10,
          align: 'left'
        });
        x += colWidths[0];
        
        doc.rect(x, y, colWidths[1], rowHeight).stroke();
        doc.text(formatCurrency(item.total_depositado), x + 5, y + 8, {
          width: colWidths[1] - 10,
          align: 'right'
        });
        x += colWidths[1];
        
        doc.rect(x, y, colWidths[2], rowHeight).stroke();
        doc.text(formatCurrency(item.total_tarjeta), x + 5, y + 8, {
          width: colWidths[2] - 10,
          align: 'right'
        });
        x += colWidths[2];
        
        doc.rect(x, y, colWidths[3], rowHeight).stroke();
        doc.text(formatCurrency(item.total_sistema), x + 5, y + 8, {
          width: colWidths[3] - 10,
          align: 'right'
        });
        x += colWidths[3];
        
        doc.rect(x, y, colWidths[4], rowHeight).stroke();
        doc.text(formatCurrency(item.total_facturado), x + 5, y + 8, {
          width: colWidths[4] - 10,
          align: 'right'
        });
        
        y += rowHeight;
      });
      
      // Totals row
      doc.font('Helvetica-Bold').fontSize(9);
      x = startX;
      
      doc.rect(x, y, colWidths[0], rowHeight).fillAndStroke('#E0E0E0', '#000000');
      doc.fillColor('#000000').text('TOTAL', x + 5, y + 8, {
        width: colWidths[0] - 10,
        align: 'left'
      });
      x += colWidths[0];
      
      doc.rect(x, y, colWidths[1], rowHeight).fillAndStroke('#E0E0E0', '#000000');
      doc.fillColor('#000000').text(formatCurrency(totales.total_depositado), x + 5, y + 8, {
        width: colWidths[1] - 10,
        align: 'right'
      });
      x += colWidths[1];
      
      doc.rect(x, y, colWidths[2], rowHeight).fillAndStroke('#E0E0E0', '#000000');
      doc.text(formatCurrency(totales.total_tarjeta), x + 5, y + 8, {
        width: colWidths[2] - 10,
        align: 'right'
      });
      x += colWidths[2];
      
      doc.rect(x, y, colWidths[3], rowHeight).fillAndStroke('#E0E0E0', '#000000');
      doc.text(formatCurrency(totales.total_sistema), x + 5, y + 8, {
        width: colWidths[3] - 10,
        align: 'right'
      });
      x += colWidths[3];
      
      doc.rect(x, y, colWidths[4], rowHeight).fillAndStroke('#E0E0E0', '#000000');
      doc.text(formatCurrency(totales.total_facturado), x + 5, y + 8, {
        width: colWidths[4] - 10,
        align: 'right'
      });
      
      // Footer
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').fillColor('#666666')
        .text(`Generado el ${new Date().toLocaleString('es-GT')}`, { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
