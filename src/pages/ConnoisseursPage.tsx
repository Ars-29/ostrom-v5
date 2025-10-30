import { useEffect, useState, useRef } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ScoreDisplay } from '../components/ScoreDisplay/ScoreDisplay';
import HamburgerMenu from '../components/HamburgerMenu';
import { useNavigate } from 'react-router-dom';
import { LabelInfoProvider } from '../contexts/LabelInfoContext';
import Logo from '../components/Logo/Logo';
import './ConnoisseursPage.scss';

// Optimized public asset paths
const heroVideo = '/assets/optimized/Ostrom-teaser-v1-1080.mp4';
const imgLandscape = '/assets/optimized/JB_00401-1080.webp';
const imgPortraitOne = '/assets/optimized/JB_00391_BL-1080.webp';
const imgPortraitTwo = '/assets/optimized/JB_00390-1080.webp';

// Use the same divider asset and resolution pathing as TitleSection
const dividerSrc = `${import.meta.env.BASE_URL}images/divider.png`;

export default function ConnoisseursPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  // Ensure root element is visible and start at hero section on mount
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) rootElement.classList.add('loaded');

    // Scroll to the top, then ensure hero is aligned at start
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 0);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Home', onClick: () => navigate('/') },
  ];
  
  return (
    <LabelInfoProvider>
      <div className="connoisseurs">
        {/* Sticky header identical styling */}
        <div className="top-header">
          <Logo className="loader-logo move-to-corner" onClick={() => navigate('/')} />
          <ScoreDisplay />
        </div>
        <HamburgerMenu
          items={menuItems}
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
          onClose={() => setIsMenuOpen(false)}
          position="right"
        />

        {/* Hero Video Section */}
        <section ref={heroRef} className="connoisseurs__hero">
          <video 
            className="connoisseurs__video"
            autoPlay 
            muted 
            loop 
            playsInline
            controls={false}
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </section>

        {/* Header */}
        <header className="connoisseurs__header">
          <h1 className="connoisseurs__title">
            Connoisseurs of Speed
          </h1>
          <img src={dividerSrc} alt="Divider" className="connoisseurs__divider-img" />
          <p className="connoisseurs__lead">
            Ström's history holds hidden treasures. Will you uncover them all?
          </p>
        </header>

        {/* Main Content */}
        <main className="connoisseurs__main">
          {/* Introduction Section */}
          <section className="connoisseurs__intro">
            <p className="connoisseurs__text" style={{ marginBottom: '1.5rem' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
        		<p className="connoisseurs__text">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </section>

          {/* Landscape Image Section */}
          <section className="connoisseurs__landscape">
            <div className="connoisseurs__image-wrap">
              <ImageWithFallback 
                src={imgLandscape}
                alt="Landscape view"
                className="connoisseurs__image-landscape"
              />
            </div>
            <div className="connoisseurs__section-body">
              <h2 className="connoisseurs__h2">The Journey Begins</h2>
              <p className="connoisseurs__text" style={{ marginBottom: '1rem' }}>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
              </p>
              <p className="connoisseurs__text">
                Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.
              </p>
            </div>
          </section>

          {/* Two Portrait Images Section */}
          <section className="connoisseurs__landscape">
            <div className="connoisseurs__grid-two">
              <div>
                <ImageWithFallback 
                  src={imgPortraitOne}
                  alt="Portrait view one"
                  className="connoisseurs__portrait"
                />
                <h3 className="connoisseurs__h3">Architectural Elegance</h3>
                <p className="connoisseurs__text">
                  At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.
                </p>
              </div>
              <div>
                <ImageWithFallback 
                  src={imgPortraitTwo}
                  alt="Portrait view two"
                  className="connoisseurs__portrait"
                />
                <h3 className="connoisseurs__h3">Urban Stories</h3>
                <p className="connoisseurs__text">
                  Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias.
                </p>
              </div>
            </div>
          </section>

          {/* Closing Section */}
          <section className="connoisseurs__closing">
            <img src={dividerSrc} alt="Divider" className="connoisseurs__divider-img" />
            <p className="connoisseurs__text" style={{ marginBottom: '1.5rem' }}>
              Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
            </p>
            <p className="connoisseurs__text">
              Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="connoisseurs__footer">
          <p className="connoisseurs__footer-text">© 2025 Connoisseurs of Speed. All rights reserved.</p>
        </footer>
      </div>
    </LabelInfoProvider>
  );
}
