const SHEET_NAME = "ورقة1";

function doGet() {
  return ContentService
    .createTextOutput("Flash Summer API Working ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {

    // قراءة البيانات القادمة من الموقع
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("لم يتم العثور على الورقة: " + SHEET_NAME);
    }

    // إضافة الطلب إلى Google Sheets
    sheet.appendRow([
      new Date(),
      data.fullName || "",
      data.phone || "",
      data.wilaya || "",
      data.commune || "",
      data.address || "",
      data.deliveryType || "",
      data.product || "فلاش الصيف للأطفال",
      data.price || 2700,
      data.status || "جديد"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "success"
      }))
      .setMimeType(ContentService.MimeType.JSON);


  } catch (err) {

    Logger.log(err);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
