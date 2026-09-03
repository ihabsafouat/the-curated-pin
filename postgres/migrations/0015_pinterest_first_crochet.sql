-- Align the Crochet hub with the Pinterest-first discovery strategy while
-- preserving its stable category URL and every existing Birthday URL.

UPDATE categories
SET intro = 'Crochet ideas, free patterns, beginner projects and practical guides built around things readers can actually finish.',
    seo_title = 'Crochet Ideas and Easy Patterns for Beginners',
    seo_description = 'Explore crochet ideas, beginner patterns, flowers, bags and blankets with materials, measurements and practical finishing guidance.',
    status = 'active',
    show_in_nav = TRUE,
    seo_index = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE path = 'crafts/crochet';
