const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controllers/productController');

// Configuração do storage para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Rotas de CRUD de produtos
router.get('/',         ctrl.index);
router.get('/new',      ctrl.new);
// Usa upload.single para processar multipart/form-data
router.post('/',        upload.single('image'), ctrl.create);

router.get('/:id',      ctrl.show);
router.get('/:id/edit', upload.single('image'), ctrl.edit);
// Aplica upload.single em edit se quiser exibir preview, mas principalmente em update
router.put('/:id',      upload.single('image'), ctrl.update);
router.delete('/:id',   ctrl.destroy);

router.get('/:id/edit', upload.single('image'), ctrl.edit);
router.put('/:id',      upload.single('image'), ctrl.update);

router.post('/:id/insumo', ctrl.addInsumo);



module.exports = router;