const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

async function testFrontend() {
  const apiJs = fs.readFileSync('./student-opportunity-engine/js/api.js', 'utf8');
  const componentsJs = fs.readFileSync('./student-opportunity-engine/js/components.js', 'utf8');
  const dashboardJs = fs.readFileSync('./student-opportunity-engine/js/dashboard.js', 'utf8');

  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <div id="sidebar-container"></div>
        <div id="header-container"></div>
        <div id="dashboard-hero-container"></div>
        <div id="summary-cards-container"></div>
        <div id="recommendations-container"></div>
        <div id="skills-container"></div>
        <div id="upcoming-container"></div>
        <script>
          // Mock fetch
          const originalFetch = window.fetch;
          window.fetch = async function(url, options) {
            console.log("FETCH CALLED:", url);
            if (url.includes('/profile')) {
              return { ok: true, json: async () => ({ name: 'Jane Doe', skills: ['Python'], careerGoals: ['AI'] }) };
            }
            if (url.includes('/dashboard/summary')) {
              return { ok: true, json: async () => ({ recommendedCount: 1 }) };
            }
            if (url.includes('/dashboard/recommendations')) {
              return { ok: true, json: async () => ([{
                id: "opp1", title: "Test Opp", category: "INTERNSHIP",
                matchScore: 80, skills: ["Python"]
              }]) };
            }
            if (url.includes('/api/recommendations/evaluate')) {
              console.log(">>> SUCCESS: Evaluate Endpoint Hit with body:", options.body);
              return { ok: true, json: async () => ({
                success: true,
                data: {
                  matchScore: 83,
                  mlPrediction: 0,
                  mlLabel: 'Poor Match',
                  explanation: 'Mock AI Explanation',
                  missingSkills: ['Machine Learning']
                }
              })};
            }
            return { ok: false, status: 404 };
          };
          // Mock localStorage
          window.localStorage = { getItem: () => 'fake_token', removeItem: () => {} };
        </script>
        <script>${componentsJs}</script>
        <script>${apiJs}</script>
        <script>${dashboardJs}</script>
      </body>
    </html>
  `;

  const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
  
  // Wait a bit for async loadDashboardData to finish
  setTimeout(() => {
    const doc = dom.window.document;
    const cards = doc.querySelectorAll('.recommendation-card');
    console.log("Cards rendered:", cards.length);
    if (cards.length > 0) {
      console.log("Clicking card...");
      cards[0].click();
      
      // Wait for the evaluate API call and rendering to finish
      setTimeout(() => {
        const analysis = doc.querySelector('.match-analysis-container');
        console.log("Analysis Container Display:", analysis.style.display);
        console.log("Analysis Container HTML:", analysis.innerHTML);
        process.exit(0);
      }, 1000);
    } else {
      console.log("No cards found!");
      process.exit(1);
    }
  }, 1000);
}

testFrontend();
