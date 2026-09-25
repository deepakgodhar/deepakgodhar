// Edit this file to change the text on the page.
// NOTE: work history, about and resume below are placeholder data — replace with the real resume.
export const content = {
  greeting: "Hi, I'm",
  name: "Deepak Godhar",
  role: "Engineering manager",
  tagline:
    "Twelve years of building software and the teams behind it. Today I lead engineering in the age of AI — putting LLMs like Claude and GPT to work, building AI agents that handle real tasks, and pairing developers with AI coding tools so small teams ship faster. I focus on turning AI from a demo into dependable product.",
  email: "deepakgodhar91@gmail.com",
  nav: [
    { label: "About", href: "#about" },
    { label: "What I do", href: "#what" },
    { label: "Career", href: "#career" },
    { label: "Resume", href: "#resume" },
    { label: "Contact", href: "#contact" },
  ],
  socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/deepak-godhar" }],

  // "What I do" — shown next to the desk scene.
  services: [
    {
      title: "Lead delivery end to end",
      body: "From scoping with the client to launch — plans, milestones, risk, and a team of 20 developers.",
    },
    {
      title: "Build e-commerce platforms",
      body: "Shopify, Magento and custom microservice stores, wired into payments, logistics and inventory systems.",
    },
    {
      title: "Architect for the cloud and AI",
      body: "Node.js and Next.js apps on AWS and GCP, and AI features built on LLMs like Claude.",
    },
  ],

  // Career, newest first.
  work: [
    {
      years: "Oct 2025 – now",
      role: "Engineering manager",
      company: "HoundstoothSC",
      summary: "Lead the engineering team building Shopify commerce and AI-powered products on AWS.",
      highlights: [
        "Lead engineering across Shopify storefronts and custom apps, from planning to release",
        "Build AI features on Claude and other LLMs — assistants, content generation and workflow automation",
        "Design and run the AWS infrastructure behind the team's products",
        "Set the team's engineering practices: code review, CI/CD and delivery planning",
      ],
      stack: ["AWS", "Shopify", "Claude", "LLMs", "AI agents"],
    },
    {
      years: "2022 – 2025",
      role: "Delivery manager & team lead",
      company: "Stigen MarkTech, Gurugram",
      summary: "Owned end-to-end delivery of e-commerce and Shopify projects, leading a team of 20 frontend and backend developers.",
      highlights: [
        "Responsible for a team of 20 developers, from planning to delivery",
        "Defined scope with clients, then set the plan, timelines, milestones and risk mitigation",
        "Designed AWS architecture and server setups with load balancing",
        "Built on Node.js and Next.js; B2C and B2B e-commerce applications",
      ],
      stack: ["Node.js", "Next.js", "Shopify", "AWS"],
    },
    {
      years: "2016 – 2022",
      role: "Team lead & senior software developer",
      company: "Karmatech Media Works, Delhi",
      summary: "Joined at the start-up stage and led client projects on Magento, WordPress and Laravel.",
      highlights: [
        "Part of every business step and decision while the company was starting up",
        "Built Google campaign banner ads with live data — FIFA scores and live cricket scores",
        "Ran servers on AWS, Oracle Cloud and Google Cloud",
        "Google Maps integrations with geolocation and live tracking",
      ],
      stack: ["PHP", "Laravel", "Magento", "WordPress"],
    },
    {
      years: "2014 – 2016",
      role: "Software developer",
      company: "Infos India, Delhi",
      summary: "Built and maintained websites and online stores.",
      highlights: ["Built e-commerce sites on Magento", "Developed many websites on WordPress and CodeIgniter"],
      stack: ["PHP", "Magento", "CodeIgniter", "WordPress"],
    },
  ],

  // Projects managed (shown in the resume).
  projects: [
    { name: "AgeEasy", role: "Delivery manager", about: "E-commerce platform on a microservice architecture, integrated with Unicommerce, Shopflo and Shopify.", stack: "Node.js, Next.js" },
    { name: "Patient Portal", role: "Team lead", about: "Healthcare portal for booking appointments, integrated with hospital information system APIs.", stack: "Node.js, Next.js" },
    { name: "EasyBuild", role: "Delivery manager", about: "E-commerce platform with multi-cart, integrated with Unicommerce, Shipsy and Hostbooks.", stack: "PHP, Laravel" },
    { name: "OKA", role: "Delivery manager", about: "Restaurant delivery application.", stack: "Node.js, Next.js" },
    { name: "Somany Ceramics", role: "Team lead", about: "E-commerce catalogue management website.", stack: "Node.js, Express" },
    { name: "Marengo Asia Hospitals", role: "Team lead", about: "Hospital group website.", stack: "Node.js, Express" },
    { name: "Voltas", role: "Lead developer", about: "E-commerce website and catalogue management.", stack: "Magento 2" },
    { name: "Al-Marooj", role: "Lead developer", about: "B2B e-commerce platform for Kuwait with Fishbowl inventory integration.", stack: "PHP, Laravel" },
    { name: "Hero FinCorp", role: "Lead developer", about: "Brand website for Hero FinCorp.", stack: "PHP, Laravel" },
  ],

  about: {
    statement:
      "I’ve spent twelve years building for the web — first as a developer, now leading the teams that deliver. These days that means putting AI to work in real products, and shipping it with a team that enjoys building it.",
    principles: [
      { title: "Own delivery end to end", body: "Scope, plan, milestones and risk — I stay accountable from the first client call to launch." },
      { title: "Stay close to the client", body: "Clear requirements and honest expectations are the best early signal of quality." },
      { title: "Keep the bar high", body: "Working with DevOps and QA so code standards and product quality hold as we move fast." },
      { title: "Build AI-first", body: "Every team works with AI — Claude and other LLMs in the product, AI agents for real tasks, and AI coding tools in the daily workflow." },
    ],
    toolbox: [
      "Claude & LLMs",
      "AI agents",
      "Generative AI",
      "Prompt engineering",
      "RAG",
      "AI coding tools",
      "Team management",
      "Delivery management",
      "Stakeholder management",
      "Requirements analysis",
      "Software architecture",
      "Node.js",
      "Next.js",
      "PHP & Laravel",
      "Shopify",
      "Magento",
      "Microservices",
      "AWS",
      "GCP",
      "MySQL",
      "MongoDB",
      "CI/CD",
      "Payment gateways",
    ],
  },

  resume: {
    title: "Engineering manager, team lead and full-stack developer",
    summary:
      "Over 12 years in backend and full-stack development, with deep experience in Node.js, PHP, Shopify and e-commerce platforms, and a track record of delivering high-quality projects across every phase of the SDLC. Now leading engineering on AWS, Shopify and AI products built on LLMs like Claude. Skilled in Agile, microservices, infrastructure as code and CI/CD.",
    education: [{ degree: "B.Tech, Computer Science", school: "PSIT, Kanpur", years: "2014" }],
  },
};

export type HeadConfig = {
  steps: number;
  width: number;
  height: number;
  // Angles are screen angles: 0 = right, 90 = down, 180 = left, 270 = up.
  directions: { name: string; angle: number }[];
  // Frames live at /<base>/<direction>/f_00.webp …
  base: string;
};

// One "look around in a circle" clip (scripts/build-ring.py): /<base>/r_000 … one frame
// every `step` degrees (0 = right, 90 = down), a_00 = facing front.
export type RingConfig = {
  kind: "ring"; count: number; step: number; approach: number; width: number; height: number; base: string;
  // where the head must land on the desk video for the match cut (its down-left pose differs)
  deskHead?: { x: number; y: number; h: number };
};
export type AnyHead = HeadConfig | RingConfig;

// Each direction is a sequence f_00 (facing front) … f_<steps> (fully turned).
export const heads: { stills: HeadConfig; video: HeadConfig; ring: RingConfig } = {
  // Built by scripts/build-directions.sh from frames-src/*.png (shown at /stills).
  stills: {
    steps: 20,
    width: 1920,
    height: 1072,
    directions: [
      { name: "right", angle: 0 },
      { name: "down-right", angle: 45 },
      { name: "down", angle: 90 },
      { name: "down-left", angle: 135 },
      { name: "left", angle: 180 },
      { name: "up-left", angle: 225 },
      { name: "up", angle: 270 },
      { name: "up-right", angle: 315 },
    ],
    base: "stills",
  },
  // Built by scripts/build-video.py from the Flow clips in scripts/clips.json (used by /try-1..3).
  // Directions without a clip yet simply ease back toward the front.
  video: {
    steps: 20,
    width: 1920,
    height: 1080,
    directions: [
      { name: "right", angle: 0 },
      { name: "left", angle: 180 },
      { name: "up", angle: 270 },
      { name: "down", angle: 90 },
      { name: "up-right", angle: 315 },
      { name: "down-right", angle: 45 },
      { name: "down-left", angle: 135 },
      { name: "up-left", angle: 225 },
    ],
    base: "video",
  },
  // Built by scripts/build-ring.py from raw/clips/ring2.mp4 (shown at /).
  ring: { kind: "ring", count: 120, step: 3, approach: 12, width: 1920, height: 1080, base: "ring", deskHead: { x: 0.452, y: 0.19, h: 0.2 } },
};
