import { NextRequest, NextResponse } from "next/server";
import ExcelJS from 'exceljs';
import moment from "moment";

export async function POST(request: NextRequest) {
    try{
        const req = await request.json();
        console.log(req);
        const data = req.data;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Damco Records');
        worksheet.columns = [
            { header: 'PO#', key: 'po_number', width: 20 },
            { header: 'Plan-HOD', key: 'plan_hod', width: 20 },
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Order Qty', key: 'order_qty', width: 20 },
            { header: 'CARTON QTY', key: 'carton_qty', width: 20 },
            { header: 'GROSS WT', key: 'gross_weight', width: 20 },
            { header: 'CARTON CBM', key: 'carton_cbm', width: 20 },
            { header: 'CTN Type', key: 'ctn_type', width: 20 },
            {header: 'Booking id', key:'booking_id', width:20}
        ];
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.border = { top: { style: 'thin', color: { argb: '000000' } },right: { style: 'thin', color: { argb: '000000' } }, bottom: { style: 'thin', color: { argb: '000000' } } };
        const rowSet = new Set();
        let firstStepRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
        data.forEach((record:any) => {
            if (!rowSet.has(record.id)) {
                const cell = worksheet.addRow({
                    po_number: record.po_number,
                    // plan_hod: new Date(record.plan_hod),
                    plan_hod: moment(record.plan_hod).format('DD-MMM-YYYY'),
                    country: record.country,
                    order_qty: record.order_qty,
                    carton_qty: parseFloat(record.carton_qty),
                    gross_weight: record.gross_weight,
                    carton_cbm: parseFloat(record.carton_cbm),
                    ctn_type: record.ctn_type,
                    booking_id: record.booking_id,
                });
                const carton_cbmCell = cell.getCell(7).address;
                const carton_qtyCell = cell.getCell(5).address;
                worksheet.getCell(`${carton_cbmCell}`).numFmt = '0.00';
                worksheet.getCell(`${carton_qtyCell}`).numFmt = '0.00';
                const gross_weightCell = cell.getCell(6).address;
                const order_qtyCell = cell.getCell(4).address;
                worksheet.getCell(`${gross_weightCell}`).value = {formula: `${order_qtyCell}*0.48`};
                rowSet.add(record.id);
            }

        const lastRow = worksheet.lastRow;
        if (lastRow) {
            for (let col = 1; col <= worksheet.columns.length; col++) { 
              const cell = lastRow.getCell(col);
              cell.border = { bottom: { style: 'thin', color: { argb: '000000' } } }; 
            }
    
            // const sectionEndColumns = [6, 13, 21, 25,28]; 
    
            for (let colNum = 1; colNum <= worksheet.columns.length; colNum++){
              for (let rowNum = firstStepRow; rowNum <= lastRow.number; rowNum++) {
                const row = worksheet.getRow(rowNum);
                const cell = row.getCell(colNum);
                cell.border = {  top: { style: 'thin', color: { argb: '000000' } },left: { style: 'thin', color: { argb: '000000' } }, right: { style: 'thin', color: { argb: '000000' } }, bottom: { style: 'thin', color: { argb: '000000' } } }; 
              }
            };
          }
    });
    worksheet.columns.forEach(column => {
        if (column && typeof column.eachCell === 'function') {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength < 10 ? 10 : maxLength;
          column.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=recipes.xlsx',
        },
      });
    } catch (error) {
        console.error('Failed to export recipes:', error);
        return new NextResponse('Error exporting damco records', { status: 500 });
    }
}