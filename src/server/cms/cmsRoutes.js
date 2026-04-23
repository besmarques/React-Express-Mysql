const express = require('express');
const mediaRoutes = require('./media/mediaRoutes');
const menuRoutes = require('./menus/menuRoutes');
const postRoutes = require('./posts/postRoutes');
const termRoutes = require('./taxonomies/termRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        module: 'cms',
    });
});

router.use(mediaRoutes);
router.use(menuRoutes);
router.use(postRoutes);
router.use(termRoutes);

module.exports = router;
