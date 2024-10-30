import { NextRequest, NextResponse } from "next/server";
import ExcelJS from 'exceljs';

export async function POST(request: NextRequest) {
    try{
        const req = await request.json();
        console.log(req);
        const data = req.data;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Nexus Records');
        worksheet.columns = [
            { header: 'PO Numbers:', key: 'po_number' },
            { header: 'Assign Equipment ID', key: 'assign_equipment_id' },
            { header: 'Booking Number', key: 'booking_number' },
            { header: 'Shipment Load Type', key: 'shipment_load_type' },
            { header: 'Invoice Number', key: 'invoice_number' },
            { header: 'BL / Waybill #', key: 'bill_waybill' },
            { header: 'Select Carrier', key: 'carrier' },
            { header: 'Updated Transload Location (US Only)', key: 'updated_transload_location_us_only' },
            {header: 'Estimated Departure Date', key:'estimated_departure_date'},
            {header: 'Equipment # Type', key: 'equipment_number_type'},
            {header: 'Seal Number', key: 'seal_number'},
            {header: 'CTN QTY', key: 'ctn_qty'},
            {header: 'UNITS', key: 'units'}
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
                    assign_equipment_id: record.assign_equipment_id,
                    booking_number: record.booking_number,
                    shipment_load_type: record.shipment_load_type,
                    invoice_number: record.invoice_number,
                    bill_waybill: record.bill_waybill,
                    carrier: record.carrier,
                    updated_transload_location_us_only: record.updated_transload_location_us_only,
                    estimated_departure_date: record.estimated_departure_date,
                    equipment_number_type: record.equipment_number_type,
                    seal_number: record.seal_number,
                    ctn_qty: record.ctn_qty,
                    units: record.units
                });
                rowSet.add(record.id);
            }

        const lastRow = worksheet.lastRow;
        if (lastRow) {
            for (let col = 1; col <= worksheet.columns.length; col++) { 
              const cell = lastRow.getCell(col);
              cell.border = { bottom: { style: 'thin', color: { argb: '000000' } } }; 
            }
    
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
            // console.log(cell.value?.toString());
            const columnLength = cell.value ? cell.value.toString().length : 10;
            console.log(columnLength,cell.value?.toString());
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength <= 10 ? 14 : maxLength+4;
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