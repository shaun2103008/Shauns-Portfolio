import MascotPortfolioHero from '@/components/ui/mascot-portfolio-hero'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full min-h-screen bg-lab-bg overflow-hidden"
      aria-label="Hero introduction"
    >
      <MascotPortfolioHero
        height="100vh"
        minHeight="720px"
        index="AI/ML"
        discipline="Systems Builder"
        tagline="ENGINEERING INTELLIGENCE"
        collection={["CGPA 9.41", "Third Year"]}
        reel={["Mumbai, Maharashtra", "Available for Roles"]}
        badge="Hire me"
        line2="SHAUN"
        line3="STEPHEN"
        word="BANIS"
        verticalTag="AI/ML"
        bracketed="AI"
        seekingLabel="Seeking*"
        seeking="AI / ML Internships"
        href="#projects"
        services={[
          "Temporal Transformers",
          "Behavioral Biometrics",
          "Computer Vision",
          "Autonomous Defense",
          "End-to-End AI Systems"
        ]}
        greetings={[
          "Hi, I'm Shaun!",
          "Welcome to my engineering lab.",
          "Explore PRISM & Behavioral CAPTCHA below!",
          "Building scalable AI with 9.41 CGPA.",
          "Click any section to inspect the live demos!"
        ]}
        skin="#f5c5a3"
        beanie="#141614"
        shirt="#0D0E0D"
        tag="#C5F36B"
        accent="#C5F36B"
        paper="#090A09"
        ink="#F5F0EB"
      />
    </section>
  )
}
