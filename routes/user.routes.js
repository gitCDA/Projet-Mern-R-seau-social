const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const uploadController = require('../controllers/upload.controller');
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/../client/public/uploads/profil`);
    },
    filename: function (req, file, cb) {
        const fileName = req.body.name + ".jpg"
        cb(null, fileName);
    },
});
const upload = multer({ storage });
// const upload = multer();

// auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

// user display
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getOneUserInfo);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch("/follow/:id", userController.follow);
router.patch("/unfollow/:id", userController.unfollow);

// upload
router.post("/upload", upload.single('file'),
    uploadController.uploadProfil);

module.exports = router;