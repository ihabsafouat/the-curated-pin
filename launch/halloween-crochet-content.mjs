const images={
  pumpkin:['pumpkin_kitchen','pumpkin_counter'],
  ghost:['halloween_ghost_pumpkin_bat','ghost_bat_halloween'],
  bat:['ghost_bat_halloween','halloween_ghost_pumpkin_bat'],
  dinosaur:Array.from({length:10},(_,i)=>`dino-${i+1}`),
  collection:['halloween_ghost_pumpkin_bat','pumpkin_kitchen']
};
const copy={
 pumpkin:['Crochet Pumpkin Pattern: A Complete Fall and Halloween Guide','Make a soft ribbed crochet pumpkin with clear shaping, stuffing, stem assembly, finishing and autumn display advice.','crochet pumpkin pattern',['Choose smooth cotton or acrylic yarn so the stitches remain visible. Make a small gauge sample before starting.','A ribbed rectangle creates deep vertical grooves; joined rounds create a rounded body. Choose one construction and follow its counts consistently.','Stuff gradually, checking the silhouette from every side. Shape the lobes with evenly spaced strands rather than pulling one groove tightly.','Sew the stem through several top stitches and keep the face optional so the pumpkin works beyond Halloween.','Keep yarn decorations away from open flames and clean or store the finished piece loosely.']],
 ghost:['The Friendliest Ghost in Town: A Witch-Hat Crochet Ghost Amigurumi Pattern for Halloween','Discover how to create an adorable witch-hat crochet ghost amigurumi for Halloween. This beginner-friendly crochet project is perfect for handmade decorations, gifts, and spooky-season crafting.','crochet ghost pattern',['A Halloween ghost does not have to be frightening. This witch-hat crochet ghost amigurumi is a soft, friendly character with a rounded body and pointed witch hat.','Use smooth white yarn for the body and dark contrast yarn for the hat to keep stitches easy to count.','Work continuous spiral rounds, mark every first stitch, and stuff gradually as the shape grows.','Embroider the sweet facial expression with black floss or insert safety eyes before final closure.','Display your finished ghost on mantels, shelves, or alongside handmade pumpkins and bats.']],
 bat:['Crochet Bat Amigurumi: Wings, Body and Assembly Guide','Plan a compact crochet bat with symmetrical wings, secure ears, embroidered details and a stable Halloween display.','crochet bat amigurumi',['Work dark yarn under strong diffused light and mark every shaping change.','Make both wings close together and compare them flat before sewing.','Pin ears and wings before attaching; sew across a broad base to distribute tension.','Use a small amount of contrast yarn for inner wings or ears without making the body heavy.','Support wings during storage and keep the bat away from heaters, flames and pets.']],
 dinosaur:['Crochet Dinosaur Amigurumi: Complete Planning and Finishing Guide','Build a friendly crochet dinosaur with balanced limbs, a secure tail, soft spikes and careful face placement.','crochet dinosaur amigurumi',['Choose a compact silhouette for a first project and record the intended finished proportions.','Smooth yarn makes increases and decreases easier to count than fuzzy yarn.','Stuff the body gradually and pin legs in pairs so the dinosaur stands evenly.','Place the tail and spikes with temporary markers before sewing permanently.','Inspect every seam, remove pins and embroider the face only after the posture is correct.']],
 collection:['Halloween Crochet Plushie Collection: Pumpkin, Ghost and Bat Display','Plan a coordinated handmade Halloween collection with contrasting silhouettes, a shared palette, efficient workflow and safe home styling.','Halloween crochet plushies',['Choose three shapes: a low pumpkin, a tall ghost and a wide-winged bat.','Repeat two or three colors across the set without making every character identical.','Finish one complete sample before batching repeated pieces such as wings or stems.','Arrange the largest low piece first, then layer the taller pieces behind it.','Photograph in soft window light and store each character dry and loosely packed.']]
};

const dinoSteps = [
  {
    heading: 'Plan the Dinosaur Silhouette and Proportions',
    body: 'A charming crochet dinosaur amigurumi begins with balanced proportions between the head, rounded body, sturdy limbs and curved tail. Visualizing the scale before starting prevents the head from drooping or the limbs from looking mismatched once stuffed.',
    caption: 'Finished crochet dinosaur amigurumi showing balanced proportions, soft posture and friendly styling.'
  },
  {
    heading: 'Select the Right Yarn, Hook and Gauge',
    body: 'Choose smooth, light-colored cotton or low-pill acrylic yarn in DK or worsted weight. Size down your crochet hook by 0.5mm to 1mm below the yarn label recommendation (typically a 2.75mm to 3.5mm hook) to produce tight, dense stitches that prevent stuffing from showing.',
    caption: 'Tight, even stitch tension ensures clean shaping and prevents stuffing from showing through.'
  },
  {
    heading: 'Crochet the Head and Snout in Continuous Spirals',
    body: 'Work the head from the rounded snout outward in continuous, unjoined spiral rounds. Place a locking stitch marker in the first stitch of every round to keep increases evenly distributed and preserve symmetrical facial curvature.',
    caption: 'Continuous spiral rounds create a seamless head silhouette with smooth curvature.'
  },
  {
    heading: 'Shape the Body and Stuff Gradually',
    body: 'Build the body with gentle, incremental increases to create a classic teardrop amigurumi silhouette. Add polyester fiberfill in small, teased tufts as you crochet, pressing firmly into the lower corners to maintain a firm, uniform core without stretching the stitches.',
    caption: 'Progressive stuffing supports the three-dimensional form and prevents lumpiness.'
  },
  {
    heading: 'Construct Sturdy, Freestanding Legs',
    body: 'Crochet four identical cylindrical legs with flat, stabilized foot pads. Keeping row and stitch counts identical across all four limbs ensures your finished dinosaur will stand securely on tables and flat shelves without tilting.',
    caption: 'Even limb proportions and flat bases give the amigurumi sturdy tabletop stability.'
  },
  {
    heading: 'Shape the Tapered Tail for Counterbalance',
    body: 'Work the tail from the slender tip with gradual increases toward the base, creating a gentle downward or lateral curve. When attached, the tail acts as a functional tripod support that counterbalances the weight of the head and forward chest.',
    caption: 'A sculpted tail provides both authentic character and crucial tripod standing balance.'
  },
  {
    heading: 'Crochet and Position the Spine Spikes',
    body: 'Make a series of graduated triangular ridge plates in a complementary or contrasting accent color. Pin the spikes along the back centerline from behind the crown down the curve of the tail before sewing them in place.',
    caption: 'Contrasting dorsal spikes add tactile detail and playful personality along the spine.'
  },
  {
    heading: 'Pin and Audition All Limbs Before Assembly',
    body: 'Never sew amigurumi components without a trial pinning first. Use long ball-head pins to position all four legs, the tail, and the dorsal spikes, then set the dinosaur on a flat desk to verify that it stands balanced before sewing any permanent stitches.',
    caption: 'Temporary pin-placement lets you fine-tune posture and alignment from every angle.'
  },
  {
    heading: 'Embroider Friendly Eyes and Facial Details',
    body: 'Mark your eye and mouth placements with pins to audition expressions. For toys intended for babies or young children, embroider the eyes and sweet smile using black cotton embroidery floss. For collector plushies, securely fasten safety eyes with washers before closing the head.',
    caption: 'Carefully spaced facial features give the dinosaur its signature friendly, gentle expression.'
  },
  {
    heading: 'Final Seam Inspection, Styling and Care',
    body: 'Inspect all sewn seams with gentle tugs to verify durability, weave all yarn ends deeply into the stuffing cavity, and gently massage the amigurumi into its ideal posture. Spot-clean with lukewarm water and mild soap, keeping the finished piece dry and loosely displayed.',
    caption: 'Completed amigurumi dinosaur ready for nursery display, play or gifting.'
  }
];

function make(key){
  const [title,dek,kw,points]=copy[key], imgs=images[key];
  const slug=key==='collection'?'halloween-crochet-plushie-collection':key==='dinosaur'?'crochet-dinosaur-amigurumi-pattern':`crochet-${key}${key==='bat'?'-amigurumi':''}-pattern`;
  const blocks=[];let n=0;
  const add=(type,x)=>blocks.push({id:`${slug}-${++n}`,type,...x});

  if (key === 'ghost') {
    const ghostTitle = 'The Friendliest Ghost in Town: A Witch-Hat Crochet Ghost Amigurumi Pattern for Halloween';
    const ghostDek = 'Discover how to create an adorable witch-hat crochet ghost amigurumi for Halloween. This beginner-friendly crochet project is perfect for handmade decorations, gifts, and spooky-season crafting.';

    // ## Meet Your New Halloween Crochet Friend
    add('heading', { level: 2, text: 'Meet Your New Halloween Crochet Friend' });
    add('paragraph', {
      text: 'A Halloween ghost does not have to be frightening. This witch-hat crochet ghost amigurumi is a soft, friendly character designed for makers who want a seasonal project with personality. Its rounded body, sweet face, and pointed witch hat make it a charming alternative to mass-produced Halloween decorations.'
    });
    add('paragraph', {
      text: 'If you are new to amigurumi, this is a manageable project: you work with small recognizable shapes, see progress quickly, and finish with a collectible character for every October. Experienced crocheters can personalize the face, hat colors, and decorative details.'
    });
    add('paragraph', {
      text: 'A crochet amigurumi ghost is a small stuffed crochet figure made by working tight rounds, shaping a soft body, adding filling, and attaching details such as eyes, cheeks, arms, and a hat. It is one of the easiest Halloween crochet projects to adapt for different skill levels.'
    });
    add('image', {
      url: '/article-media/crochet/halloween_ghost_pumpkin_bat.png',
      alt: 'Handmade crochet ghost amigurumi styled for Halloween with seasonal pumpkins',
      caption: 'Soft rounded crochet ghost with seasonal Halloween styling and friendly expression.'
    });
    add('internal_link', {
      eyebrow: 'KEEP EXPLORING',
      title: 'Easy Crochet Patterns for Beginners',
      body: 'Explore beginner-friendly crochet patterns designed to build foundational stitching and shaping skills before tackling larger projects.',
      anchor: 'Explore beginner crochet patterns',
      url: '/article/easy-crochet-patterns-for-beginners'
    });

    // ## Why Crochet Amigurumi Is Perfect for Halloween Crafting
    add('heading', { level: 2, text: 'Why Crochet Amigurumi Is Perfect for Halloween Crafting' });
    add('heading', { level: 3, text: 'The Growing Love for Handmade Halloween Decorations' });
    add('paragraph', {
      text: 'Handmade decorations bring a warmer feeling to Halloween than identical store-bought pieces. A crocheted ghost can become part of your seasonal collection, a yearly keepsake, or a thoughtful handmade gift. You can match the yarn palette to your home, make several sizes, and reuse the pieces long after the holiday.'
    });
    add('heading', { level: 3, text: 'Why Beginners Love Crochet Amigurumi Patterns' });
    add('paragraph', {
      text: 'Amigurumi projects are compact, use less yarn than large projects, and teach essential skills: counting rounds, increases, decreases, gradual stuffing, and symmetry. For a smaller warm-up, try the [Easy Crochet Flower Pattern for Beginners](/article/easy-crochet-flowers-for-beginners) before starting the ghost.'
    });
    add('internal_link', {
      eyebrow: 'RECOMMENDED WARM-UP',
      title: 'Easy Crochet Flower Pattern for Beginners',
      body: 'Practice quick petal shaping and continuous rounds before starting three-dimensional amigurumi figures.',
      anchor: 'Try the easy flower pattern',
      url: '/article/easy-crochet-flowers-for-beginners'
    });

    // ## Meet the Witch-Hat Crochet Ghost Amigurumi Pattern
    add('heading', { level: 2, text: 'Meet the Witch-Hat Crochet Ghost Amigurumi Pattern' });
    add('heading', { level: 3, text: 'The Inspiration Behind This Friendly Ghost Design' });
    add('paragraph', {
      text: 'The design combines classic Halloween symbols with a gentle character. The white ghost body keeps it recognizable while the witch hat adds a playful seasonal detail. It works on a bookshelf, mantel, nursery shelf, party table, or as a handmade gift.'
    });
    add('heading', { level: 3, text: 'What Makes This Pattern Special' });
    add('paragraph', {
      text: 'The pattern includes a rounded body, a cute embroidered or safety-eye face, a pointed witch hat, and simple finishing. It is approachable for confident beginners while leaving room for stripes, stars, ribbons, and tiny accessories.'
    });
    add('image', {
      url: '/article-media/crochet/ghost_bat_halloween.png',
      alt: 'Witch-hat crochet ghost amigurumi shown with bat plushie Halloween decor',
      caption: 'Detailed silhouette showing the pointed witch hat and soft amigurumi shaping.'
    });
    add('bullets', {
      title: 'What makes this pattern special',
      items: [
        'Rounded, stable ghost body designed to sit securely on flat surfaces',
        'Playful pointed witch hat with customizable brim and contrast band',
        'Safe embroidered facial features or secured safety eyes',
        'Compact size perfect for mantels, shelves, and handmade gift giving',
        'Beginner-friendly spiral rounds and gradual stuffing technique'
      ]
    });
    // MIDDLE PRODUCT CTA
    add('lead_magnet', {
      eyebrow: 'PRINTABLE PATTERN PDF',
      title: 'Get the full crochet ghost pattern PDF',
      body: 'Want the exact witch-hat proportions, round-by-round instructions, and finishing sequence? Download the printable pattern before you begin.',
      cta: 'Get the full pattern PDF',
      url: `/free/${slug}`
    });

    // ## Materials Needed for Your Crochet Ghost Amigurumi
    add('heading', { level: 2, text: 'Materials Needed for Your Crochet Ghost Amigurumi' });
    add('heading', { level: 3, text: 'Recommended Crochet Supplies' });
    add('paragraph', {
      text: 'Use smooth white yarn for the body, black yarn for the face, and one or two accent colors for the hat. Prepare a suitable crochet hook, fiber filling, yarn needle, scissors, stitch markers, safety eyes or embroidery thread, and a row counter. For young children, embroidered eyes are safer than safety eyes.'
    });
    add('table', {
      title: 'Crochet ghost material specifications',
      headers: ['Supply', 'Recommendation', 'Why It Matters'],
      rows: [
        ['Body Yarn', 'DK or Worsted smooth white yarn (cotton or acrylic)', 'Ensures crisp stitch definition and easy round counting'],
        ['Hat Yarn', 'Black, purple, orange, or deep green accent yarn', 'Adds vibrant seasonal contrast to the witch hat'],
        ['Crochet Hook', '2.75 mm – 3.5 mm (size down 0.5–1mm)', 'Creates tight, dense stitches that keep stuffing concealed'],
        ['Stuffing', 'Polyester fiberfill', 'Fills smoothly without creating lumps or distortion'],
        ['Face Details', 'Black embroidery floss or 8mm safety eyes', 'Embroidered eyes are safest for toddlers and young children'],
        ['Notions', 'Locking stitch markers, yarn needle, sharp scissors', 'Crucial for tracking spiral rounds and invisible seam weaving']
      ]
    });
    add('heading', { level: 3, text: 'Choosing the Right Yarn for Amigurumi' });
    add('paragraph', {
      text: 'Smooth cotton gives crisp stitch definition and a structured finish. Firm acrylic is affordable and offers many Halloween colors. Avoid fluffy yarn for a first attempt because it hides stitch counts. Use a slightly smaller hook when necessary to create dense fabric without visible stuffing.'
    });
    add('internal_link', {
      eyebrow: 'STITCH FOUNDATION',
      title: 'Beginner Crochet Stitches Guide',
      body: 'Review foundational single crochet, increases, and tension controls with our visual stitch order.',
      anchor: 'Read the beginner stitches guide',
      url: '/article/beginner-crochet-stitches-guide'
    });

    // ## Step-by-Step Guide to Creating Your Halloween Crochet Ghost
    add('heading', { level: 2, text: 'Step-by-Step Guide to Creating Your Halloween Crochet Ghost' });
    add('heading', { level: 3, text: 'Step 1 — Crochet the Ghost Body' });
    add('paragraph', {
      text: 'Begin with a magic ring or the method specified in the PDF. Work in continuous rounds and mark the first stitch. Use evenly spaced increases to widen the body, then continue with regular rounds before shaping the base. Add stuffing gradually so the shape stays smooth.'
    });
    add('heading', { level: 3, text: 'Step 2 — Add the Ghost Details' });
    add('paragraph', {
      text: 'Place the eyes and mouth temporarily before securing them. Add embroidered cheeks if desired. Pin both arms before sewing and check that they sit at the same height. Hide yarn tails inside the body.'
    });
    add('heading', { level: 3, text: 'Step 3 — Create the Witch Hat' });
    add('paragraph', {
      text: 'Crochet the hat in black, purple, orange, or deep green. Shape the cone with increases, then add a brim. A contrasting band, buckle, star, or moon makes the accessory special. Test the hat on the ghost before weaving in the ends.'
    });
    add('heading', { level: 3, text: 'Step 4 — Assemble Your Finished Amigurumi' });
    add('paragraph', {
      text: 'Arrange every piece before sewing. View the ghost from the front, side, and back. Close the opening neatly, weave in all ends, and shape the base so the ghost can sit or stand securely.'
    });
    add('checklist', {
      title: 'Assembly and finishing checklist',
      items: [
        'Confirm continuous spiral rounds are marked with a locking stitch marker',
        'Pack fiberfill in small, teased tufts into the crown and lower corners',
        'Audition eye and mouth placement before final embroidery or securing washers',
        'Fit and test the witch hat cone and brim angle on the ghost head',
        'Weave all yarn tails deeply into the internal stuffing cavity'
      ]
    });

    // ## Beginner Crochet Tips for Making Amigurumi
    add('heading', { level: 2, text: 'Beginner Crochet Tips for Making Amigurumi' });
    add('heading', { level: 3, text: 'Keep Your Tension Consistent' });
    add('paragraph', {
      text: 'Loose stitches make stuffing visible. Try a smaller hook or tighten your rhythm gently, without creating hand strain.'
    });
    add('heading', { level: 3, text: 'Use Stitch Markers to Stay Organized' });
    add('paragraph', {
      text: 'Mark the first stitch of every round and confirm stitch totals after increases and decreases.'
    });
    add('heading', { level: 3, text: 'Do Not Be Afraid of Mistakes' });
    add('paragraph', {
      text: 'Unraveling a few rounds is part of learning. Fix leaning, uneven, or oversized sections before assembly.'
    });
    add('tip', {
      label: 'CURATED TIP',
      title: 'Test tension with a three-round gauge cup',
      body: 'Work the first three rounds and gently press a tuft of fiberfill behind the fabric. If any white stuffing peeks through between the stitches, switch to a hook 0.5mm smaller before continuing.'
    });

    // ## Creative Ways to Use Your Crochet Witch Ghost
    add('heading', { level: 2, text: 'Creative Ways to Use Your Crochet Witch Ghost' });
    add('heading', { level: 3, text: 'Halloween Home Decorations' });
    add('paragraph', {
      text: 'Place the ghost on a mantel, coffee table, tiered tray, or shelf. Make three ghosts with different hat colors. Add a loop to hang one from a doorknob or seasonal branch.'
    });
    add('paragraph', {
      text: 'For a complete display, pair it with the [Crochet Pumpkin Pattern](/article/crochet-pumpkin-pattern) and [Halloween Crochet Plushie Collection](/article/halloween-crochet-plushie-collection).'
    });
    add('internal_link', {
      eyebrow: 'SEASONAL DISPLAY',
      title: 'Crochet Pumpkin Pattern',
      body: 'Add warm autumn texture and ribbed pumpkin shapes to complement your ghost on mantels and tables.',
      anchor: 'View the crochet pumpkin pattern',
      url: '/article/crochet-pumpkin-pattern'
    });
    add('heading', { level: 3, text: 'Handmade Gifts' });
    add('paragraph', {
      text: 'Give it as a Halloween party gift, teacher gift, stocking stuffer, or seasonal keepsake. Add a gift tag or package it with candy.'
    });
    add('heading', { level: 3, text: 'Selling Handmade Crochet Creations' });
    add('paragraph', {
      text: 'Photograph the ghost in natural light and explain materials, dimensions, care, and whether the hat is removable. Check the pattern designer’s license before selling finished pieces made from the PDF.'
    });

    // ## Frequently Asked Questions
    add('faq', {
      title: 'Frequently asked questions',
      items: [
        { question: 'Is this crochet ghost amigurumi pattern beginner-friendly?', answer: 'Yes. It is suitable for crocheters familiar with basic single crochet, increases, decreases, sewing, and stuffing. The printable PDF keeps the materials and construction steps together.' },
        { question: 'How long does it take to crochet an amigurumi ghost?', answer: 'Time depends on experience, yarn, hook size, and added details. A confident crocheter may finish it in one or two sessions; beginners may prefer several evenings.' },
        { question: 'What yarn is best for crochet amigurumi patterns?', answer: 'Smooth cotton gives crisp stitches and structure. Firm acrylic is affordable and offers a wide color range. Choose yarn that creates dense fabric without visible gaps.' },
        { question: 'Can I sell finished crochet ghosts made from this pattern?', answer: 'Check the pattern designer’s license first. Some designers permit small-scale handmade sales with credit; others restrict commercial use. Do not redistribute the PDF.' },
        { question: 'What other Halloween crochet patterns can I make?', answer: 'Try pumpkins, bats, witches, spiders, candy decorations, or a coordinated plushie collection. Continue with the Crochet Bat Amigurumi Pattern and Crochet Dinosaur Amigurumi Pattern.' }
      ]
    });

    // END PRODUCT CTA
    add('lead_magnet', {
      eyebrow: 'FREE CROCHET PATTERN',
      title: 'Download the complete Witch-Hat Crochet Ghost Amigurumi PDF',
      body: 'Ready to bring your ghost to life? Download the complete Witch-Hat Crochet Ghost Amigurumi PDF and start your Halloween project today.',
      cta: 'Download the printable pattern',
      url: `/free/${slug}`
    });

    // ## Bring Halloween to Life One Stitch at a Time
    add('heading', { level: 2, text: 'Bring Halloween to Life One Stitch at a Time' });
    add('paragraph', {
      text: 'A handmade ghost is a small project with a big seasonal personality. Choose your yarn, mark your first round, and let each stitch bring this friendly character to life.'
    });
    add('paragraph', {
      text: 'Continue the collection with the [Crochet Pumpkin Pattern](/article/crochet-pumpkin-pattern), [Crochet Bat Amigurumi Pattern](/article/crochet-bat-amigurumi-pattern), [Crochet Dinosaur Amigurumi Pattern](/article/crochet-dinosaur-amigurumi-pattern), and [Halloween Crochet Plushie Collection](/article/halloween-crochet-plushie-collection).'
    });
    add('internal_link', {
      eyebrow: 'COMPLETE THE SET',
      title: 'Halloween Crochet Plushie Collection',
      body: 'Plan a coordinated handmade Halloween display with pumpkin, ghost, and bat plushies together.',
      anchor: 'Explore the plushie collection',
      url: '/article/halloween-crochet-plushie-collection'
    });
    add('internal_link', {
      eyebrow: 'SPOOKY COMPANION',
      title: 'Crochet Bat Amigurumi Pattern',
      body: 'Create a wide-winged amigurumi bat with symmetrical shaping and secure ears.',
      anchor: 'View the crochet bat pattern',
      url: '/article/crochet-bat-amigurumi-pattern'
    });
    add('internal_link', {
      eyebrow: 'POPULAR HANDMADE TOY',
      title: 'Crochet Dinosaur Amigurumi Pattern',
      body: 'Build a friendly freestanding dinosaur with textured back spikes and balanced four-leg posture.',
      anchor: 'View the crochet dinosaur pattern',
      url: '/article/crochet-dinosaur-amigurumi-pattern'
    });
    add('internal_link', {
      eyebrow: 'SUMMER WEARABLE',
      title: 'Crochet Bralette Pattern',
      body: 'Craft a stylish handmade crochet bralette top with modern summer fashion appeal.',
      anchor: 'View the crochet bralette pattern',
      url: '/article/crochet-bralette-pattern'
    });

    return {
      slug,
      categoryPath: 'crafts/crochet',
      title: ghostTitle,
      dek: ghostDek,
      readTime: '11 min read',
      seoTitle: 'Crochet Ghost Pattern | Witch-Hat Amigurumi Halloween Tutorial',
      seoDescription: ghostDek,
      image: '/article-media/crochet/halloween_ghost_pumpkin_bat.png',
      imageAlt: ghostTitle,
      socialImage: '/article-media/crochet/halloween_ghost_pumpkin_bat.png',
      primaryKeyword: 'crochet ghost pattern',
      secondaryKeywords: ['crochet amigurumi patterns', 'Halloween crochet patterns', 'beginner crochet projects', 'handmade Halloween decorations', 'amigurumi ghost tutorial', 'witch hat crochet ghost'],
      blocks
    };
  }

  if (key === 'dinosaur') {
    add('paragraph', {
      text: 'Crochet amigurumi dinosaurs are among the most rewarding handmade projects to create. With soft curves, playful dorsal spikes, and sturdy legs, this friendly dinosaur pattern is designed to be beginner-friendly while delivering a polished, freestanding finish.'
    });

    dinoSteps.forEach((step, i) => {
      add('heading', { level: 2, text: step.heading });
      add('paragraph', { text: step.body });
      add('image', {
        url: `/article-media/crochet/dino-${i+1}.png`,
        alt: `${step.heading} - crochet dinosaur guide`,
        caption: step.caption
      });
    });

    add('gallery', {
      title: 'Crochet Dinosaur Angles & Assembly Gallery',
      images: Array.from({length: 10}, (_, i) => ({
        url: `/article-media/crochet/dino-${i+1}.png`,
        alt: `Crochet dinosaur amigurumi reference view ${i+1}`,
        caption: dinoSteps[i]?.caption || `Dinosaur amigurumi reference view ${i+1}`
      }))
    });

    add('bullets', {
      title: 'Dinosaur amigurumi essential checklist',
      items: [
        'Use smooth DK or worsted yarn with a sized-down hook',
        'Mark the first stitch of every unjoined spiral round',
        'Stuff firmly in small increments as each piece grows',
        'Audition all limbs and tail with pins to confirm tabletop balance',
        'Embroider facial features for infant safety or use secured safety eyes',
        'Weave all yarn tails internally through the stuffing core'
      ]
    });

    add('table', {
      title: 'Dinosaur project specifications',
      headers: ['Component', 'Specification', 'Notes'],
      rows: [
        ['Skill level', 'Easy to Intermediate', 'Requires basic single crochet and spiral shaping'],
        ['Recommended yarn', 'DK or worsted weight yarn', 'Cotton for crisp stitch definition, acrylic for softness'],
        ['Hook size', '2.75 mm – 3.5 mm', 'Size down 0.5–1mm from yarn label suggestion'],
        ['Finished size', 'Approx. 6–8 inches tall', 'Depends on yarn gauge and personal tension'],
        ['Best for', 'Nursery decor, gifts, toys', 'Embroider eyes for infants and toddlers under 3']
      ]
    });

    add('faq', {
      title: 'Frequently asked questions',
      items: [
        ['Is this crochet dinosaur pattern beginner-friendly?', 'Yes. The pattern uses foundational amigurumi techniques including magic ring, single crochet, and simple increases and decreases.'],
        ['How do I prevent polyfill stuffing from showing through?', 'Use a crochet hook that is 0.5mm to 1mm smaller than the label indicates and maintain firm, even tension on every single crochet stitch.'],
        ['How do I make the dinosaur stand independently?', 'Ensure all four legs have flat bases and identical lengths, and angle the tail downward to form a stable tripod with the rear legs.'],
        ['What is the safest way to finish the eyes?', 'For toys given to babies or toddlers, embroider the eyes with cotton floss to eliminate choking hazards from plastic safety eyes.']
      ]
    });

    add('tip', {
      label: 'CURATED TIP',
      title: 'Test the tripod stance before seaming',
      body: 'Pin the legs and tail in place, then set the dinosaur on a flat desk. If it tips forward or backward, adjust the tail angle slightly downward to create a rock-solid tripod base before securing your seams.'
    });

    add('lead_magnet', {
      eyebrow: 'FREE CROCHET PATTERN',
      title: 'Get the complete dinosaur amigurumi pattern PDF',
      body: 'Enter your email to receive the ad-free printable dinosaur amigurumi pattern, yarn checklist, and row tracker.',
      cta: 'Send me the pattern',
      url: `/free/${slug}`
    });

    return {
      slug,
      categoryPath: 'crafts/crochet',
      title,
      dek,
      readTime: '12 min read',
      seoTitle: 'Crochet Dinosaur Amigurumi Pattern | Easy Handmade Dino Toy Guide',
      seoDescription: dek,
      image: `/article-media/crochet/dino-1.png`,
      imageAlt: title,
      socialImage: `/article-media/crochet/dino-1.png`,
      primaryKeyword: kw,
      secondaryKeywords: ['easy crochet pattern', 'free crochet pattern', 'crochet dinosaur pattern', 'amigurumi dinosaur tutorial'],
      blocks
    };
  }

  const headings=['Start with the right shape','Materials and preparation','Construction decisions','Finishing and safety','Style and care'];
  headings.forEach((h,i)=>{
    add('heading',{level:2,text:h});
    add('paragraph',{text:`${points[i]} ${dek} This section explains the practical decision behind the step so readers can adapt the project to their yarn, tension and intended use.`});
    if(imgs[i%2]&&i===1)add('image',{url:`/article-media/crochet/${imgs[0]}.png`,alt:title,caption:'Supplied visual reference for color, scale and styling.'});
    if(imgs[1]&&i===3)add('image',{url:`/article-media/crochet/${imgs[1]}.png`,alt:title,caption:'Compare the finished silhouette before final assembly.'});
  });
  add('bullets',{title:'Quick project checklist',items:['Confirm yarn weight and hook size','Mark rounds and count stitches','Secure all sewn parts','Record finished dimensions','Store the finished item dry']});
  add('tip',{label:'CURATED TIP',title:'Make one test piece first',body:'A small sample reveals tension and proportion problems before you spend time on the complete project.'});
  const cleanItem = title.split(':')[0].trim();
  add('lead_magnet',{eyebrow:'FREE CROCHET PATTERN',title:`Get the complete ${cleanItem.toLowerCase()} PDF`,body:`Enter your email to receive the ad-free printable ${cleanItem.toLowerCase()} pattern, materials checklist, and assembly guide.`,cta:'Send me the pattern',url:`/free/${slug}`});
  return {
    slug,
    categoryPath:'crafts/crochet',
    title,
    dek,
    readTime:'10 min read',
    seoTitle:title,
    seoDescription:dek,
    image:imgs[0]?`/article-media/crochet/${imgs[0]}.png`:'',
    imageAlt:title,
    socialImage:imgs[0]?`/article-media/crochet/${imgs[0]}.png`:'',
    primaryKeyword:kw,
    secondaryKeywords:['easy crochet pattern','free crochet pattern','Halloween crochet ideas'],
    blocks
  };
}
export const halloweenCrochetArticles=Object.keys(copy).map(make);

