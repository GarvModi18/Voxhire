import React from "react";
import styled from "styled-components";

// Navbar Component
const Navbar = styled.nav`
  background-color: #ff6600; // Orange color
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;

  .logo {
    font-size: 24px;
    font-weight: bold;
  }

  .nav-links {
    list-style-type: none;
    display: flex;
    gap: 20px;
  }

  .nav-links li {
    cursor: pointer;
    font-size: 18px;
  }
`;

const Container = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: #000; // Black background for main section
  color: white;
`;

const FeatureSection = styled.section`
  background-color: #333; // Greyish background for features
  padding: 60px 20px;
  color: #f1f1f1;
`;

const FeatureTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 30px;
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  text-align: left;
`;

const FeatureCard = styled.div`
  background-color: #444; // Slightly lighter grey for cards
  padding: 20px;
  border-radius: 8px;
`;

const FeatureDesc = styled.p`
  color: #dcdcdc; // Lighter grey for description
`;

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Navbar */}
      <Navbar>
        <div className="logo">Voxhire</div>
        <ul className="nav-links">
          <li>Home</li>
          <li>Features</li>
          <li>Pricing</li>
          <li>Contact</li>
        </ul>
      </Navbar>

      {/* Hero Section */}
      <Container>
        <h1>Welcome to Voxhire</h1>
        <p>Your AI-driven interview platform for smarter hiring</p>
      </Container>

      {/* Features Section */}
      <FeatureSection>
        <FeatureTitle>Features</FeatureTitle>
        <FeatureList>
          <FeatureCard>
            <h3>Dynamic Question Generation</h3>
            <FeatureDesc>
              AI-driven question generation based on candidate responses ensures
              a personalized and adaptive interview experience.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <h3>Real-Time Speech Transcription</h3>
            <FeatureDesc>
              Converts candidate responses into text instantly, allowing for
              real-time analysis and evaluation.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <h3>AI Avatar Interaction</h3>
            <FeatureDesc>
              A lifelike AI avatar interacts with candidates, asking questions,
              providing feedback, and creating a more engaging interview
              process.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <h3>Marking Per Answer</h3>
            <FeatureDesc>
              Automatic scoring based on predefined criteria for both HR and
              technical questions ensures consistency in evaluation.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <h3>Real-Time Visual Feedback</h3>
            <FeatureDesc>
              The system evaluates visual cues, such as clothing and hygiene, to
              provide additional feedback during the interview process.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <h3>Live Coding Environment</h3>
            <FeatureDesc>
              A built-in live coding interface allows candidates to complete
              coding challenges in real-time, with immediate feedback on their
              performance.
            </FeatureDesc>
          </FeatureCard>
        </FeatureList>
      </FeatureSection>
    </div>
  );
};

export default HomePage;
