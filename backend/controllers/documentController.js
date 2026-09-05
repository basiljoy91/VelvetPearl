const fs = require('fs');
const GeneratedDocument = require('../models/generatedDocumentModel');

const downloadByToken = async (req, res, next) => {
  try {
    const document = await GeneratedDocument.getByToken(req.params.token);

    if (!document || !fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    res.setHeader('Content-Type', document.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
    return fs.createReadStream(document.file_path).pipe(res);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  downloadByToken,
};
