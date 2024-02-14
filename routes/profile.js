const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth } = require('../middleware/auth');

const Profile = require('../models/Profile');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadprofile');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });


// @desc Show profile
// @route GET /profile
router.get('/', ensureAuth, async (req, res) => {
    try {
        console.log('Fetching profile...');
        const profile = await Profile.findOne({ user: req.user.id }).lean();
        if (profile) {
            console.log('Profile fetched:', profile);
            res.render('profile', {
                layout: 'admin',
                profile
            });
        } else {
            console.log('No profile found. Redirecting to add page.');
            res.redirect('/profile/add');
        }
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.render('error/500');
    }
});



// @desc Show add page
// @route GET /profile/add
router.get('/add', ensureAuth, (req, res) => {
    try {
        console.log('Reached /profile/add route');
        res.render('profile/add', {
            layout: 'admin'
        });
    } catch (error) {
        console.error('Error rendering add profile page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// @desc Process add profile form with image upload
// @route POST /profile
router.post('/', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;

        if (!file || file.length === 0) {
            const error = new Error('Please choose an image.');
            error.httpStatusCode = 400;
            throw error;
        }

        const img = fs.readFileSync(file.path);
        const encode_image = img.toString('base64');

        const newProfile = new Profile({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        await newProfile.save();
        console.log("New profile with image/upload is created");
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Internal Server Error' });
    }
});



// @desc Show edit page
// @route GET /profile/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id).lean();

        if (!profile) {
            return res.render('error/404');
        }

        if (profile.user.toString() !== req.user.id) {
            return res.redirect('/profile');
        } else {
            res.render('profile/edit', {
                profile,
                layout: 'admin',

            });
        }
        console.log("You are in storie/edit page & can Edit this profile info");
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc Show Update page
// @route POST /profile/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        let profile = await Profile.findById(req.params.id).lean();

        if (!profile) {
            console.log('profile not found');
            return res.render('error/404');
        }

        if (String(profile.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/profile');
        }

        const file = req.file;
        const existingImage = profile.imageBase64;

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
                contentType: profile.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        profile = await Profile.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('profile updated successfully');
        res.redirect('/profile', {
            layout: 'admin',
        });
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Delete profile
// @route DELETE /profile/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        let profile = await Profile.findById(req.params.id).lean();

        if (!profile) {
            return res.render('error/404');
        }

        if (profile.user != req.user.id) {
            res.redirect('/profile');
        } else {
            await profile.deleteOne({ _id: req.params.id });
            res.redirect('/profile', {
                layout: 'admin',
            });
        }
        console.log("profile Deleted Successfully !");

    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});




module.exports = router