const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const Bittaa = require('../models/Bittaa');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadbittaa');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });


// @desc Show add bittaa page
// @route GET /bittaa/addbittaa
router.get('/addbittaa', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('bittaa/addbittaa', {
        title: 'bittaa Page',
        layout: 'admin',
    });
});


// @desc Process add bittaa form with image upload
// @route POST /bittaa
router.post('/', ensureAuth, ensureAdminOrWorker, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;

        if (!file || file.length === 0) {
            const error = new Error('Please choose files');
            error.httpStatusCode = 400;
            throw error;
        }

        const img = fs.readFileSync(file.path);
        const encode_image = img.toString('base64');

        const newUpload = new Bittaa({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/bought');
            console.log("New bittaa with image/upload is Registered");

        } catch (error) {
            if (error.name === 'MongoError' && error.code === 11000) {
                return res.status(400).json({ error: `Duplicate ${file.originalname}. File Already exists! ` });
            }
            return res.status(500).json({ error: error.message || `Cannot Upload ${file.originalname} Something Missing!` });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Internal Server Error' });
    }
});


// @desc Show all bittaas
// @route GET /bittaa/index
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const bittaa = await Bittaa.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean();

        res.render('bittaa/index', {
            layout: 'admin',
            bittaa,
        });
        console.log("You can now see All bittaa Here !");
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Show single bittaa
// @route   GET /bittaa/:id
router.get('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let bittaa = await Bittaa.findById(req.params.id)
            .populate('user')
            .lean()

        if (!bittaa) {
            return res.render('error/404')
        }

        if (bittaa.user._id != req.user.id) {
            res.render('error/404')
        } else {
            res.render('bittaa/show', {
                bittaa,
                layout: 'admin',
            })
        }
        console.log("You can now see the bittaa details");
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc Show edit page
// @route GET /bittaa/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const bittaa = await Bittaa.findById(req.params.id).lean();

        if (!bittaa) {
            return res.render('error/404');
        }

        if (bittaa.user.toString() !== req.user.id) {
            return res.redirect('/bought', {
                layout: 'admin',
            });
        } else {
            res.render('bittaa/edit', {
                bittaa,
                layout: 'admin',
            });
        }
        console.log("You are in bittaa/edit page & can Edit this bittaa info");
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Show Update page
// @route POST /bittaa/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        let bittaa = await Bittaa.findById(req.params.id).lean();

        if (!bittaa) {
            console.log('bittaa not found');
            return res.render('error/404');
        }

        if (String(bittaa.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/bittaa'), {
                layout: 'admin',
            }
        }

        const file = req.file;
        const existingImage = bittaa.imageBase64;

        let updatedFields = req.body;

        if (file) {
            const img = fs.readFileSync(file.path);
            const encode_image = img.toString('base64');
            updatedFields = {
                ...updatedFields,
                contentType: file.mimetype,
                imageBase64: encode_image,
            };
        } else {
            updatedFields = {
                ...updatedFields,
                contentType: bittaa.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        bittaa = await Bittaa.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('bittaa updated successfully');
        res.redirect('/bittaa');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc Delete bittaa
// @route DELETE /bittaa/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        let bittaa = await Bittaa.findById(req.params.id).lean();

        if (!bittaa) {
            return res.render('error/404');
        }

        if (bittaa.user != req.user.id) {
            res.redirect('/bought');
        } else {
            await bittaa.deleteOne({ _id: req.params.id });
            res.redirect('/bought'), {
                layout: 'admin',
            }
        }
        console.log("bittaa Deleted Successfully !");

    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc User bittaa
// @route GET /bittaa/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const bittaa = await Bittaa.find({
            user: req.params.userId,
        }).populate('user').lean();

        res.render('bittaa/index', {
            bittaa,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});



//@desc Search bittaa by title
//@route GET /bittaa/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const bittaa = await Bittaa.find({ name: new RegExp(req.query.query, 'i') })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('bittaa/index', { bittaa });
        console.log("Search is working !");
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});


module.exports = router;