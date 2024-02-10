const express = require('express')
const { ensureAuth, ensureAdminOrWorker } = require('../middleware/auth')
const mongoose = require('mongoose');
const router = express.Router()

const Buy = require('../models/Buy')

// @desc    Show addbuy page
// @route   GET /buy/addbuy
router.get('/addbuy', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('buy/addbuy', { title: "buy Page" })
})


// @desc    Process add buy form
// @route   POST /buys
router.post('/', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        console.log('Received data:', req.body);

        req.body.user = req.user.id;
        await Buy.create(req.body);
        res.redirect('/buys');
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }

});


// @desc    Show all buy
// @route   GET /buy
router.get('/', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const buy = await Buy.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean()

        res.render('buy/index', {
            buy,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc    Show single buy
// @route   GET /buy/:id
router.get('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let buy = await Buy.findById(req.params.id)
            .populate('user')
            .lean()

        if (!buy) {
            return res.render('error/404')
        } else {
            res.render('buy/show', {
                buy,
            })
        }
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})


// @desc    Show edit page
// @route   GET /buy/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const buy = await Buy.findOne({
            _id: req.params.id,
        }).lean()

        if (!buy) {
            return res.render('error/404')
        } else {
            res.render('buy/edit', {
                buy,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// @desc    Update buy
// @route   PUT /buy/:id
router.post('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let buy = await Buy.findById(req.params.id).lean()

        if (!buy) {
            return res.render('error/404')
        }

        if (buy.user != req.user.id) {
            res.redirect('/buys')
        } else {
            buy = await Buy.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/buys')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// @desc    Delete buy
// @route   DELETE /buy/:id
router.delete('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let buy = await Buy.findById(req.params.id).lean();

        if (!buy) {
            return res.render('error/404');
        }

        if (buy.user != req.user.id) {
            res.redirect('/buy');
        } else {
            await buy.deleteOne({ _id: req.params.id });
            res.redirect('/buys');
        }
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});

// @desc    User buy
// @route   GET /buy/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const buy = await Buy.find({
            user: req.params.userId,
            case: 'Normal',
        })
            .populate('user')
            .lean();

        res.render('buy/index', { buy });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

//@desc Search buy by title
//@route GET /buy/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const buy = await Buy.find({ name: new RegExp(req.params.query, 'i'), case: 'Normal' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('buy/index', { buy });
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});

module.exports = router;
