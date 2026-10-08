const db = require('./index');

async function seedProductReviews() {
  console.log('--- SEEDING BALANCED REVIEWS (2.5 to 4.5 AVG) ACROSS ALL PRODUCTS ---');

  // 1. Fetch all products
  const prodRes = await db.query(`
    SELECT p.id, p.name, p.brand, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.active = true
    ORDER BY p.id ASC
  `);

  console.log(`Found ${prodRes.rows.length} products to populate with reviews.`);

  // Clear existing reviews to ensure clean balanced data
  await db.query('DELETE FROM product_reviews');

  // Authentic pool of reviewer names
  const indianNames = [
    'Aarav Deshmukh', 'Pooja Iyer', 'Rohan Kulkarni', 'Sneha Patil', 'Vikas Nair',
    'Neha Bansal', 'Aditya Verma', 'Ananya Sengupta', 'Siddharth Rao', 'Priyanka Sharma',
    'Manish Choudhary', 'Kavita Joshi', 'Gaurav Mehta', 'Divya Menon', 'Rahul Bhatia',
    'Simran Kaur', 'Akash Sundaram', 'Tanvi Mahajan', 'Karthik Raman', 'Meera Trivedi',
    'Nikhil Saxena', 'Ritu Aggarwal', 'Deepak Hegde', 'Shruti Goswami', 'Harsh Parekh',
    'Anjali Mukherjee', 'Sanjay Pillai', 'Bhavna Chawla', 'Varun Kapoor', 'Pallavi Rane',
    'Pranav Dsouza', 'Archana Shinde', 'Sameer Quadri', 'Swati Bhatt', 'Kunal Merchant',
    'Vidya Krishnan', 'Ajay Godbole', 'Natasha Sen', 'Mohit Vora', 'Juhi Pandey'
  ];

  // Specific contextual review templates by category/rating
  const reviewTemplates = {
    5: [
      (p) => `Outstanding build quality and top-notch performance from ${p.brand}. Delivered safely to my doorstep with Cash on Delivery verified. Highly recommend!`,
      (p) => `Exceeded all my expectations. Benchmark scores are solid and temperatures stay very cool. Authentic packaging and brand warranty included.`,
      (p) => `Super happy with this purchase. Plugged in and worked seamlessly from day 1. Best value in this budget.`
    ],
    4: [
      (p) => `Solid and very reliable product. Performance matches the listed specifications accurately. Build quality is 4/5, delivery was prompt.`,
      (p) => `Great value for money! Works smoothly for my daily workload and gaming sessions. Only small gripe is packaging box had slight crease, but hardware is 100% fine.`,
      (p) => `Good hardware from ${p.brand}. Fast transfer speeds and clean finish. Definitely a good buy for anyone building or upgrading their setup.`,
      (p) => `Very satisfied with the performance. Easy to install and recognized instantly by the motherboard. Minor noise under heavy full load, but otherwise great.`
    ],
    3: [
      (p) => `Decent product for the price point. It does the job as described, but feels a bit standard compared to high-end premium alternatives. Average 3-star performer.`,
      (p) => `Functions okay. Average thermals and speeds. If you are on a tight budget it is fine, but enthusiasts might want higher tiers.`,
      (p) => `Good for basic everyday tasks, but struggles slightly during extended heavy loads. Fair purchase overall.`,
      (p) => `Acceptable quality from ${p.brand}. Works as intended but nothing extraordinary. Standard performance.`
    ],
    2: [
      (p) => `Hardware is working, but runs slightly warmer than expected. Needs adequate cabinet airflow. Average build aesthetics.`,
      (p) => `Product functions but documentation in box was very minimal. Setup took a bit of extra troubleshooting.`
    ]
  };

  // Helper to pick random element
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Target averages: evenly distribute target ratings between 2.8 and 4.4
  // Target average brackets:
  // Bracket A: ~3.0 avg (Ratings: [3, 3, 3] or [4, 3, 2])
  // Bracket B: ~3.5 avg (Ratings: [4, 3, 4] or [4, 4, 3, 3])
  // Bracket C: ~4.0 avg (Ratings: [4, 4, 4] or [5, 4, 3])
  // Bracket D: ~4.3 avg (Ratings: [5, 4, 4] or [5, 4, 4, 4])
  // Bracket E: ~2.7 avg (Ratings: [3, 2, 3] or [3, 3, 2])

  const ratingSchemes = [
    [4, 3, 4],       // Avg: 3.67
    [4, 4, 3, 3],    // Avg: 3.50
    [5, 4, 4],       // Avg: 4.33
    [4, 4, 4],       // Avg: 4.00
    [3, 3, 3],       // Avg: 3.00
    [5, 4, 3],       // Avg: 4.00
    [4, 3, 2, 4],    // Avg: 3.25
    [5, 4, 4, 4],    // Avg: 4.25
    [3, 2, 3],       // Avg: 2.67
    [4, 4, 3],       // Avg: 3.67
    [4, 5, 4],       // Avg: 4.33
    [3, 4, 3, 4],    // Avg: 3.50
    [4, 3, 3]        // Avg: 3.33
  ];

  let totalInserted = 0;
  let nameIndex = 0;

  for (let i = 0; i < prodRes.rows.length; i++) {
    const p = prodRes.rows[i];
    const scheme = ratingSchemes[i % ratingSchemes.length];

    for (const rating of scheme) {
      const author = indianNames[nameIndex % indianNames.length];
      nameIndex++;

      const templateList = reviewTemplates[rating] || reviewTemplates[4];
      const commentGen = pick(templateList);
      const comment = commentGen(p);

      await db.query(`
        INSERT INTO product_reviews (product_id, author_name, rating, review, approved, created_at)
        VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP - INTERVAL '${Math.floor(Math.random() * 60) + 1} days')
      `, [p.id, author, rating, comment]);

      totalInserted++;
    }
  }

  console.log(`Successfully seeded ${totalInserted} authentic reviews across ${prodRes.rows.length} products.`);

  // Verify averages
  const statsRes = await db.query(`
    SELECT 
      MIN(avg_rating) as min_avg,
      MAX(avg_rating) as max_avg,
      AVG(avg_rating) as overall_avg
    FROM (
      SELECT p.id, AVG(pr.rating) as avg_rating
      FROM products p
      JOIN product_reviews pr ON p.id = pr.product_id
      GROUP BY p.id
    ) sub
  `);

  console.log('--- REVIEWS STATS ---');
  console.log(`Min Product Avg Rating: ${parseFloat(statsRes.rows[0].min_avg).toFixed(2)} / 5.0`);
  console.log(`Max Product Avg Rating: ${parseFloat(statsRes.rows[0].max_avg).toFixed(2)} / 5.0`);
  console.log(`Overall Catalog Average: ${parseFloat(statsRes.rows[0].overall_avg).toFixed(2)} / 5.0`);

  process.exit(0);
}

seedProductReviews().catch(err => {
  console.error('Review seed failed:', err);
  process.exit(1);
});
